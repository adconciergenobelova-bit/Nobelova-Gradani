<?php
/**
 * Inquiry endpoint for nobelovagradani.org
 *
 * The page works without this file: script.js falls back to a WhatsApp /
 * mailto draft when the request fails. With it, every inquiry is also emailed
 * to the routing list below and appended to private/leads.jsonl, so a visitor
 * who submits and then closes the tab is no longer invisible.
 *
 * Deploy: upload next to index.html. cPanel serves .php out of the box; no
 * database, no composer, no build step.
 */

declare(strict_types=1);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const RECIPIENTS = [
    'contact@nobelovagradani.org',
    'klinicappointment@nobelovagradani.org',
    'nobelovagradani@gmail.com',
];
const FROM_ADDRESS = 'website@nobelovagradani.org';
const FROM_NAME    = 'Nobelova Gradani website';
const LOG_FILE     = __DIR__ . '/private/leads.jsonl';
const RATE_WINDOW  = 600;   // seconds
const RATE_MAX     = 6;     // submissions per window per IP

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function respond(int $status, array $payload): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Trim, normalise line endings and cap the length of a submitted value.
 * Deliberately avoids mbstring: not every shared host has it enabled, and a
 * missing extension must not take the endpoint down.
 */
function field(string $key, int $max = 500): string
{
    $value = $_POST[$key] ?? '';
    if (!is_string($value)) {
        return '';
    }
    $value = str_replace(["\r\n", "\r"], "\n", trim($value));
    if (preg_match('/^.{0,' . $max . '}/us', $value, $match) === 1) {
        return $match[0];
    }
    return substr($value, 0, $max);
}

/** Header values must never contain CR/LF (header injection). */
function header_safe(string $value): string
{
    return trim(preg_replace('/[\r\n]+/', ' ', $value) ?? '');
}

function client_ip(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/** Simple fixed-window rate limit; fails open if the temp dir is not writable. */
function rate_limited(string $ip): bool
{
    $file = sys_get_temp_dir() . '/ng-rate-' . hash('sha256', $ip) . '.json';
    $now  = time();
    $hits = [];
    if (is_file($file)) {
        $decoded = json_decode((string) file_get_contents($file), true);
        if (is_array($decoded)) {
            $hits = array_values(array_filter($decoded, static fn ($t) => is_int($t) && $t > $now - RATE_WINDOW));
        }
    }
    if (count($hits) >= RATE_MAX) {
        return true;
    }
    $hits[] = $now;
    @file_put_contents($file, json_encode($hits), LOCK_EX);
    return false;
}

// ---------------------------------------------------------------------------
// Request checks
// ---------------------------------------------------------------------------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

// Honeypot: a real visitor never fills a hidden "company" field.
if (field('company', 100) !== '') {
    respond(202, ['ok' => true, 'ref' => 'NG-OK']); // pretend success; drop it
}

if (rate_limited(client_ip())) {
    respond(429, ['ok' => false, 'error' => 'too_many_requests']);
}

$name    = field('name', 100);
$phone   = preg_replace('/[\s\-()]/', '', field('phone', 30)) ?? '';
$service = field('service', 120) ?: field('course', 120);
$message = field('message', 2000);
$context = field('context', 40) ?: 'inquiry';
$school  = field('school', 160);

if (preg_match('/^\s*[^\s]{2,}/u', $name) !== 1) {
    respond(422, ['ok' => false, 'error' => 'invalid_name']);
}
if (!preg_match('/^(?:\+?234|0)[789]\d{9}$/', $phone)) {
    respond(422, ['ok' => false, 'error' => 'invalid_phone']);
}

$ref = 'NG-' . strtoupper($context === 'booking' ? 'BOO' : ($context === 'enrollment' ? 'ENR' : 'INQ'))
     . '-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));

// ---------------------------------------------------------------------------
// Compose
// ---------------------------------------------------------------------------
$lines = [
    'New website request',
    '',
    'Reference: ' . $ref,
    'Form:      ' . $context,
    'Name:      ' . $name,
    'Phone:     ' . $phone,
];
if ($service !== '') {
    $lines[] = 'Service:   ' . $service;
}
if ($school !== '') {
    $lines[] = 'School:    ' . $school;
}
foreach (['date' => 'Date', 'time' => 'Time'] as $key => $label) {
    $value = field($key, 40);
    if ($value !== '') {
        $lines[] = str_pad($label . ':', 11) . $value;
    }
}
$lines[] = '';
$lines[] = 'Message:';
$lines[] = $message !== '' ? $message : '(none)';
$lines[] = '';
$lines[] = 'Sent from https://www.nobelovagradani.org/ on ' . gmdate('Y-m-d H:i:s') . ' UTC';
$lines[] = 'IP: ' . client_ip();

$body = implode("\n", $lines);
$subject = 'Website ' . $context . ' request from ' . $name;

$headers = [
    'From: ' . header_safe(FROM_NAME) . ' <' . FROM_ADDRESS . '>',
    'Reply-To: ' . FROM_ADDRESS,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Request-Id: ' . $ref,
    'MIME-Version: 1.0',
];

$sent = @mail(
    implode(',', RECIPIENTS),
    header_safe($subject),
    $body,
    implode("\r\n", $headers),
    '-f' . FROM_ADDRESS
);

// Always keep a local copy: mail() returning false is common on shared hosts
// with a misconfigured MTA, and a lost lead is worse than a log line.
@mkdir(dirname(LOG_FILE), 0750, true);
@file_put_contents(
    LOG_FILE,
    json_encode([
        'at'      => gmdate('c'),
        'ref'     => $ref,
        'context' => $context,
        'name'    => $name,
        'phone'   => $phone,
        'service' => $service,
        'school'  => $school,
        'message' => $message,
        'mailed'  => $sent,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n",
    FILE_APPEND | LOCK_EX
);

respond(200, ['ok' => true, 'ref' => $ref, 'mailed' => (bool) $sent]);
