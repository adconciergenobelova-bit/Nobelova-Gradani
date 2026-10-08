/* ================= DATA ================= */
      const WA_NUMBER = "2348081959392";
      const FORM_EMAILS = [
        "ceo@nobelovagradani.org",
        "abasuperintendent@nobelovagradani.org",
        "adminsupport@nobelovagradani.org",
        "contact@nobelovagradani.org",
        "humanresourcecoord@nobelovagradani.org",
        "humanresourcecoord2@nobelovagradani.org",
        "klinicappointment@nobelovagradani.org",
        "nobelovaklinicadmin@nobelovagradani.org",
        "nobelovaklinicadmin2@nobelovagradani.org",
        "nobelovaklinicadmin3@nobelovagradani.org",
      ];
      const SCHOOLS = [
        "Estaport",
        "HD School",
        "Jasper Montessori School",
        "Lady Bird",
        "LASUTH",
        "Busy Mind",
        "Hilchesy",
        "Sure Start",
        "Children Development Centre",
        "Hope House",
        "Manner",
        "Play House",
        "Role Model",
        "Supreme House",
        "Temple School",
        "The Rock",
        "Ask Toks",
        "Totncat",
        "Treasure House",
        "Betty's Schools",
        "Zarah's",
        "The Riverbank School",
        "River Oak",
        "Oakwood",
        "Tree",
        "White",
        "GIC",
        "Jesus",
        "TKS",
        "GB",
        "FORE",
        "DH",
        "HS",
        "COR",
        "FT",
        "GGG",
        "Grace School",
        "The Foreshore School",
        "The Learning Place",
        "The Whiteoak School",
        "Park View International",
        "Cedars",
        "First Quiver",
        "Mayville",
      ];
      const FIRSTS = [
        "Amina",
        "Blessing",
        "Chinedu",
        "Dami",
        "Emeka",
        "Funmilayo",
        "Chidera",
        "Onome",
        "Tunde",
        "Yetunde",
        "Rotimi",
        "Ngozi",
        "Chinwe",
        "Tobi",
        "Adaeze",
        "Oluchi",
        "Nnamdi",
        "Ifeoma",
        "Segun",
        "Aisha",
        "Femi",
        "Kunle",
        "Halimat",
        "Yusuf",
        "Ibrahim",
        "Musa",
        "Zainab",
        "Funke",
        "Ovie",
        "Bayo",
        "Simisola",
        "Chidi",
        "Nkem",
        "Sade",
        "Oghene",
        "Tayo",
        "Chidinma",
        "Efe",
        "Yemi",
        "Onyeka",
        "Sadiq",
        "Nneka",
        "Chiamaka",
        "Demola",
        "Kemi",
        "Ibikunle",
        "Olufemi",
        "Nwokolo",
        "Ayodele",
        "Nkiru",
        "Titilope",
        "Omoayo",
        "Abimbola",
        "Dapo",
        "Ebuka",
        "Ogbuoma",
        "Eniola",
        "Keremi",
        "Keremi",
        "Olisa",
        "Babatunde",
      ];
      const LASTS = [
        "Adeyemi",
        "Okonkwo",
        "Nwosu",
        "Okafor",
        "Eze",
        "Bakare",
        "Chukwuemeka",
        "Ogunleye",
        "Adebayo",
        "Olatunji",
        "Nwogbaga",
        "Ibe",
        "Etim",
        "Bassey",
        "Nwanunobi",
        "Uche",
        "Adewale",
        "Balogun",
        "Ezeudu",
        "Nwankwo",
        "Ogundele",
        "Anyanwu",
        "Onodera",
        "Adepu",
        "Ekanem",
        "Iwu",
        "Chukwu",
        "Nmegwa",
        "Akpan",
        "Ogbu",
        "Ezeh",
        "Ndo",
        "Obasi",
        "Okoye",
        "Umeh",
        "Lawal",
        "Tanko",
        "Babs Fa",
        "Sadiq",
        "Bello",
        "Nuhu",
        "Okoro",
        "Oligbojo",
        "Nti",
        "Agwutoro",
        "Kalu",
        "Okosun",
        "Akpofure",
        "Obi",
        "Anozie",
        "Odiko",
        "Nnwata",
        "Ekwuemeka",
        "Ihinkie",
        "Nne",
        "Chukwara",
        "Isong",
        "Udeme",
        "Ezeah",
        "Ugwu",
        "Idakwo",
        "Achike",
        "Omeire",
        "Ochako",
      ];

      /* ================= LOGO MARQUEE ================= */
      (function () {
        const chips = SCHOOLS.map((s) => {
          const ini = s
            .replace(/\./g, "")
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase();
          return `<span class="logo-chip"><span class="mono">${ini}</span><span class="nm">${s}</span></span>`;
        }).join("");
        document.getElementById("logoTrack").innerHTML =
          `<div class="flex gap-3 pr-3">${chips}</div><div class="flex gap-3 pr-3" aria-hidden="true">${chips}</div>`;
      })();

      /* ================= TESTIMONIAL MARQUEE ================= */
      (function () {
        const track = document.getElementById("testimonialTrack");
        const group = track?.firstElementChild;
        if (
          !track ||
          !group ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          return;
        }
        const duplicate = group.cloneNode(true);
        duplicate.setAttribute("aria-hidden", "true");
        duplicate.querySelectorAll("img").forEach((image) => {
          image.alt = "";
        });
        track.appendChild(duplicate);
      })();

      /* ================= TEAM ROSTER ================= */
      (function () {
        const track = document.querySelector("#team .marquee-track");
        if (!track) return;

        const staff = [
          ["Abigail Samson", "IBT"],
          ["Adegbuyi Daniel", "Admin Concierge/Data Analyst"],
          ["Ademuyiwa Arafat Oluwadamilola", "ABA Tutor"],
          ["Adesegun Qudus", "ABA Tutor"],
          ["Adodo Christian", "ABA Tutor"],
          ["Afolashade Alabi", "ABA Tutor"],
          ["Ajayi Damilola", "ABA Tutor"],
          ["Akinade Taiwo", "IBT"],
          ["Akinola Jokodola", "NDD"],
          ["Akintomide Gloria", "ABA Tutor"],
          ["Amarachi Okafor", "ABA Tutor"],
          ["Andrew David", "ABA Tutor"],
          ["Anger Angela", "ABA Tutor"],
          ["Blessing Edet", "ABA Tutor"],
          ["Blessing Ikhile", "NDD"],
          ["Blessing Jacob", "ABA Tutor"],
          ["Blessing Obasi", "NDD"],
          ["Bolaji Aremu", "ABA Tutor"],
          ["Bridget Iyabode Eesuola", "QABA"],
          ["Charles Iloabueke", "School Health Manager"],
          ["Charles Peace Itohan", "ABA Tutor"],
          ["Christian Archibong", "ABA Tutor"],
          ["Christine Kennedy Ekanem", "ABA Tutor"],
          ["Clementina Amadiegwu", "ABA Tutor"],
          ["Damilola Ogunlade", "ABA Tutor"],
          ["Deborah Adebowale", "ABA Tutor"],
          ["Deborah Osoaku", "ABA Tutor"],
          ["Dorcas Blessing Peter", "NDD"],
          ["Doris Ifeoma Duru", "NDD"],
          ["Elisha Iliya", "HR/Client Relations Superintendent"],
          ["Emmanuella Ochela", "ABA Tutor"],
          ["Eniola Martins", "ABA Tutor"],
          ["Esther Oluwatayo", "ABA Tutor"],
          ["Evelyn Alakpa", "IBT"],
          ["Ezeamaka Faith Justine", "ABA Tutor"],
          ["Favour Egualeona", "ABA Tutor"],
          ["Favour Ogbaje", "School Health Team"],
          ["Favour Olaseinde", "ABA Tutor"],
          ["Folakemi Rasheed", "ABA Tutor"],
          ["Funke Ajose", "NDD"],
          ["Gladys Duru", "NDD"],
          ["Gloria Ejeh", "ABA Tutor"],
          ["Glory Ogbeche", "ABA Tutor"],
          ["Grace Akinsulire", "NDD"],
          ["Haniel Holy Monday", "Data Analyst"],
          ["Hannah Folorunsho", "ABA Tutor"],
          ["Helen Oshikoya", "QABA-S, IBA"],
          ["Idris Abayomi", "ABA Tutor"],
          ["Ifeoluwa Adewumi", "ABA Tutor"],
          ["Israel Friday", "NDD"],
          ["Jennifer Okekearu", "ABA Tutor"],
          ["Jeremiah Ikhide", "Clinic Administrator"],
          ["Jeremiah Olalekan", "Senior Data Analyst"],
          ["John Ajimisogbe", "QABA, IBA/Program Site Manager"],
          ["Kehinde Deborah Ayandeji", "ABA Tutor"],
          ["Kennedy Abisola", "ABA Tutor"],
          ["Lilian Okon", "ABA Tutor"],
          ["Margaret Abah", "School Health Team"],
          ["Margaret Ameh", "ABA Tutor"],
          ["Mary Owakoyi Idoga", "ABA Tutor"],
          ["Motunrayo Makinde", "ABA Tutor"],
          ["Nathalie James", "IBT"],
          ["Nicholas Ehigie", "NDD"],
          ["Offiong Joy", "ABA Tutor"],
          ["Ogunsowobo Ayomitunde", "NDD"],
          ["Ohaneme Jecinta", "ABA Tutor"],
          ["Okobi Precious", "ABA Tutor"],
          ["Olaide Olasubomi", "NDD"],
          ["Olajide Esther", "ABA Tutor"],
          ["Olamide Yusuf", "NDD"],
          ["Olawale Olaitan", "ABA Tutor"],
          ["Oluwafunmilayo Habeeb", "NDD"],
          ["Omokorede Akintola", "ABA Tutor"],
          ["Omosefe Ugbo", "NDD"],
          ["Opeyemi Eunice Fakunle", "ABA Tutor"],
          ["Opeyemi Ibitayo", "NDD"],
          ["Opeyemi Ogedengbe", "ABA Tutor"],
          ["Ozovehe Suliyat", "ABA Tutor"],
          ["Patience Ekwuenechi", "ABA Tutor"],
          ["Patience Ogbonna", "ABA Tutor"],
          ["Patience Orisa", "ABA Tutor"],
          ["Pelumi Adedayo", "ABA Tutor"],
          ["Priscilla Oride", "NDD"],
          ["Rachael Olaniyi", "ABA Tutor"],
          ["Raphael Ohunta", "ABA Tutor"],
          ["Samuel Adeleke", "Social Media Manager"],
          ["Tinuola Sulaimon", "IBT"],
          ["Tobi Adam Olatunji", "Accounting Officer"],
          ["Tolulope Iyunade", "IBT"],
          ["Tope Jolayemi", "ABA Tutor"],
          ["Toyin Jacob", "NDD"],
          ["Toyosi Kolawole", "ABA Tutor"],
          ["Ufot Ekaette", "QASP-S"],
          ["Victoria Daniel Nsikan", "NDD"],
          ["Farayola Hassan", "School Health Team"],
        ];
        const photos = new Map([
          ["Adegbuyi Daniel", "Daniel%20Adegbuyi.jpg"],
          ["Charles Iloabueke", "Iloabueke%20Charles.jpg"],
          ["Helen Oshikoya", "Mrs.%20Helen%20Oshikoya.jpeg"],
          ["Jeremiah Ikhide", "Jeremiah%20Ikhide.jpg"],
          ["Jeremiah Olalekan", "Jeremiah%20Olalekan.jpg"],
          ["John Ajimisogbe", "John%20Temidayo%20Ajimisogbe.jpg"],
        ]);
        const group = document.createElement("div");
        group.className = "team-marquee-group";

        staff
          .sort((a, b) => a[0].localeCompare(b[0], "en", { sensitivity: "base" }))
          .forEach(([name, title]) => {
            const card = document.createElement("article");
            card.className = "team-card bg-white rounded-3xl border border-ink/5 shadow-chip overflow-hidden flex-shrink-0 w-64";

            const photo = photos.get(name);
            if (photo) {
              const image = document.createElement("img");
              image.className = "aspect-[4/5] w-full object-cover object-[center_12%]";
              image.src = photo;
              image.alt = name;
              card.appendChild(image);
            } else {
              const avatar = document.createElement("div");
              avatar.className = "grid aspect-[4/5] place-items-center bg-pine-700 text-white font-display font-bold text-4xl";
              avatar.textContent = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
              card.appendChild(avatar);
            }

            const details = document.createElement("div");
            details.className = "p-4";
            const heading = document.createElement("h3");
            heading.className = "font-display font-bold text-lg text-ink";
            heading.textContent = name;
            const role = document.createElement("p");
            role.className = "text-sm font-semibold text-pine-700";
            role.textContent = title;
            details.append(heading, role);
            card.appendChild(details);
            group.appendChild(card);
          });

        track.replaceChildren(group);
        track.id = "teamTrack";
        track.classList.add("team-track");
      })();

      /* ================= TEAM MARQUEE ================= */
      (function () {
        const track = document.getElementById("teamTrack");
        const group = track?.firstElementChild;
        if (
          !track ||
          !group ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          return;
        }
        const duplicate = group.cloneNode(true);
        duplicate.setAttribute("aria-hidden", "true");
        duplicate.querySelectorAll("img").forEach((image) => {
          image.alt = "";
        });
        track.appendChild(duplicate);
        track.classList.add("is-looping");
      })();

      /* ================= COUNTERS ================= */
      (function () {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (!e.isIntersecting) return;
              const el = e.target,
                target = +el.dataset.count,
                dur = 1500,
                t0 = performance.now();
              const tick = (t) => {
                const p = Math.min(1, (t - t0) / dur),
                  ez = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * ez).toLocaleString(
                  "en-US",
                );
                if (p < 1) requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
              io.unobserve(el);
            });
          },
          { threshold: 0.4 },
        );
        document
          .querySelectorAll("[data-count]")
          .forEach((el) => io.observe(el));
      })();

      /* ================= HEADER / DRAWER / DROPDOWN ================= */
      (function () {
        const hdr = document.getElementById("siteHeader");
        addEventListener(
          "scroll",
          () => hdr.classList.toggle("is-scrolled", scrollY > 24),
          { passive: true },
        );

        const svcBtn = document.getElementById("svcBtn"),
          svcMenu = document.getElementById("svcMenu");
        svcBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const open = svcMenu.classList.toggle("hidden");
          svcBtn.setAttribute("aria-expanded", String(!open));
        });
        document.addEventListener("click", () => {
          svcMenu.classList.add("hidden");
          svcBtn.setAttribute("aria-expanded", "false");
        });

        const drawer = document.getElementById("drawer"),
          menuBtn = document.getElementById("menuBtn");
        function setDrawer(open) {
          drawer.classList.toggle("hidden", !open);
          document.body.style.overflow = open ? "hidden" : "";
          menuBtn.setAttribute("aria-expanded", String(open));
        }
        menuBtn.addEventListener("click", () => setDrawer(true));
        drawer
          .querySelectorAll("[data-close-drawer]")
          .forEach((el) =>
            el.addEventListener("click", () => setDrawer(false)),
          );
        drawer
          .querySelectorAll("a[href^='#']")
          .forEach((a) => a.addEventListener("click", () => setDrawer(false)));
        addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            setDrawer(false);
            svcMenu.classList.add("hidden");
          }
        });
      })();

      /* ================= INQUIRY FORMS (per service) ================= */
      (function () {
        const SERVICES = [
          { id: "child-development", label: "Child Development" },
          { id: "aba", label: "Pediatric Applied Behavior Analysis Services (PABA)" },
          { id: "screening", label: "School Health Screening" },
          { id: "training", label: "Training & Certification" },
        ];
        SERVICES.forEach((s, i) => {
          const host = document.querySelector(
            `.tab-panel[data-panel="${s.id}"] .inq-slot`,
          );
          host.innerHTML = `
      <form class="lead-form grid gap-4" data-context="inquiry" data-service="${s.label}" novalidate>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="flabel" for="in-name-${i}">Full name</label>
            <input class="field" id="in-name-${i}" name="name" autocomplete="name" placeholder="Your name" required>
            <p class="errmsg">Please enter your name.</p>
          </div>
          <div>
            <label class="flabel" for="in-phone-${i}">Phone / WhatsApp</label>
            <input class="field" id="in-phone-${i}" name="phone" type="tel" autocomplete="tel" placeholder="0800 000 0000" required>
            <p class="errmsg">Enter a valid Nigerian mobile number.</p>
          </div>
        </div>
        <div>
          <label class="flabel" for="in-svc-${i}">Service</label>
          <input class="field" id="in-svc-${i}" value="${s.label}" readonly>
        </div>
        <div>
          <label class="flabel" for="in-msg-${i}">How can we help?</label>
          <textarea class="field" id="in-msg-${i}" name="message" rows="3" placeholder="Briefly describe your need or question…"></textarea>
        </div>
        <button type="submit" class="btn btn-primary w-full py-3.5">Send ${s.label.toLowerCase()} inquiry</button>
        <p class="text-xs text-ink/45 -mt-2">Your details are used only to respond to this inquiry (NDPA 2023).</p>
      </form>
      <div class="form-success hidden rounded-2xl border border-pine-200 bg-pine-50 p-6 text-center">
        <span class="mx-auto grid place-items-center w-12 h-12 rounded-full bg-pine-700 text-white">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </span>
        <h3 class="mt-4 font-display font-bold text-xl text-ink">Inquiry ready to email.</h3>
        <p class="mt-2 text-sm text-ink/65">Open the email draft below and press Send. Reference: <strong class="text-ink"><span class="ref"></span></strong></p>
        <div class="mt-5 flex flex-wrap justify-center gap-3">
          <a href="#" data-email class="btn btn-primary px-6 py-3 text-sm">Email request</a>
          <a href="#" data-wa class="btn btn-gold px-6 py-3 text-sm" target="_blank" rel="noopener">Send a reminder on WhatsApp</a>
        </div>
      </div>`;
        });

        /* Tabs */
        document.querySelectorAll(".inq-tab").forEach((btn) => {
          btn.addEventListener("click", () => {
            document
              .querySelectorAll(".inq-tab")
              .forEach((b) => b.setAttribute("aria-selected", "false"));
            btn.setAttribute("aria-selected", "true");
            document
              .querySelectorAll(".tab-panel")
              .forEach((p) =>
                p.classList.toggle(
                  "hidden",
                  p.dataset.panel !== btn.dataset.tab,
                ),
              );
          });
        });
      })();

      /* ================= LEAD FORM HANDLER ================= */
      (function () {
        document.querySelectorAll("form.lead-form").forEach((f) => {
          f.querySelectorAll(".field").forEach((inp) => {
            inp.addEventListener("input", () => inp.classList.remove("err"));
          });
          f.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = f.querySelector("[name=name]"),
              phone = f.querySelector("[name=phone]");
            let ok = true;
            if (!name || name.value.trim().length < 2) {
              if (name) name.classList.add("err");
              ok = false;
            } else if (name) name.classList.remove("err");
            const pd = phone ? phone.value.replace(/[\s-]/g, "") : "";
            if (!phone || !/^(?:\+234|0)[789]\d{9}$/.test(pd)) {
              if (phone) phone.classList.add("err");
              ok = false;
            } else phone.classList.remove("err");
            if (!ok) return;
            const ctx = f.dataset.context || "inquiry";
            const ref =
              "NG-" +
              ctx.slice(0, 3).toUpperCase() +
              "-" +
              Math.random().toString(36).slice(2, 8).toUpperCase();
            const panel = f.parentElement,
              succ = panel.querySelector(".form-success");
            succ.querySelector(".ref").textContent = ref;
            let digits = pd.replace(/\D/g, "");
            if (digits.startsWith("0")) digits = "234" + digits.slice(1);
            const svc =
              f.dataset.service ||
              (f.querySelector("[name=service],[name=course]") || {}).value ||
              ctx;
            const action =
              ctx === "booking"
                ? "book a free consultation for"
                : ctx === "enrollment"
                  ? "request to enroll in"
                  : "ask about";
            const msg = `Hello Nobelova Gradani! My name is ${name.value.trim()} (${pd}). I would like to ${action} ${svc}. Reference ${ref}.`;
            const wa = succ.querySelector("[data-wa]");
            const formDetails = [...new FormData(f).entries()]
              .filter(([, value]) => String(value).trim())
              .map(([key, value]) => `${key}: ${value}`)
              .join("\n");
            const emailBody = [
              "New Nobelova Gradani website request",
              `Form: ${ctx}`,
              `Service: ${svc}`,
              formDetails,
              `Reference: ${ref}`,
            ]
              .filter(Boolean)
              .join("\n\n");
            const email = succ.querySelector("[data-email]");
            email.href = `mailto:${FORM_EMAILS.join(",")}?subject=${encodeURIComponent(
              `Website ${ctx} request from ${name.value.trim()}`,
            )}&body=${encodeURIComponent(emailBody)}`;
            wa.setAttribute(
              "href",
              `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
            );
            f.classList.add("hidden");
            succ.classList.remove("hidden");
            succ.scrollIntoView({ behavior: "smooth", block: "center" });
          });
        });
        const d = document.getElementById("bk-date");
        if (d) d.min = new Date().toISOString().split("T")[0];
      })();

      /* Course buttons preselect enrollment course */
      (function () {
        document.querySelectorAll("[data-course]").forEach((b) => {
          b.addEventListener("click", () => {
            const sel = document.getElementById("en-course");
            if (sel) sel.value = b.dataset.course;
            document
              .getElementById("enroll")
              .scrollIntoView({ behavior: "smooth" });
          });
        });
      })();

      /* ================= MISC ================= */
      document.getElementById("year").textContent = new Date().getFullYear();

window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", "G-XXXXXXXXXX");
