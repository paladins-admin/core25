const menu = document.querySelector(".menu");
const links = document.querySelector(".nav-links");

if (menu && links) {
    menu.addEventListener("click", () => {
        const isOpen = links.classList.toggle("open");
        menu.setAttribute("aria-expanded", String(isOpen));
    });

    links.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            links.classList.remove("open");
            menu.setAttribute("aria-expanded", "false");
        });
    });
}

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.12
    }
);

document.querySelectorAll(".reveal").forEach((element) => {
    observer.observe(element);
});

document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
});

if (typeof emailjs !== "undefined") {
    emailjs.init({
        publicKey: "FtAPiE63Z8v5bf0gR"
    });
}

const form = document.querySelector("#contactForm");

if (form) {
    const messageElement = document.querySelector("#contactStatus");
    const submitButton = document.querySelector("#contactSubmit");
    const originalButtonText = submitButton
        ? submitButton.textContent
        : "Send enquiry";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (typeof emailjs === "undefined") {
            showMessage(
                "The email service could not be loaded. Please email hello@core25.com.au directly.",
                "error"
            );
            return;
        }

        const name = document.querySelector("#name")?.value.trim() || "";
        const email = document.querySelector("#email")?.value.trim() || "";
        const organisation =
            document.querySelector("#organisation")?.value.trim() || "";
        const interest =
            document.querySelector("#interest")?.value.trim() || "";
        const enquiryMessage =
            document.querySelector("#message")?.value.trim() || "";
        const website =
            document.querySelector("#website")?.value.trim() || "";

        if (website) {
            form.reset();
            showMessage("Thanks. Your enquiry has been sent.", "success");
            return;
        }

        if (!name || !email || !interest || !enquiryMessage) {
            showMessage(
                "Please complete all required fields.",
                "error"
            );
            return;
        }

        if (!isValidEmail(email)) {
            showMessage(
                "Please enter a valid email address.",
                "error"
            );
            return;
        }

        setSubmitting(true);
        showMessage("Sending your enquiry...", "loading");

        const templateParameters = {
            name,
            email,
            organisation: organisation || "Not provided",
            interest,
            message: enquiryMessage,
            from_name: name,
            from_email: email,
            reply_to: email,
            company: "Core25",
            website_name: "core25.com.au"
        };

        try {
            await emailjs.send(
                "service_p5kj2sh",
                "template_adfue9m",
                templateParameters
            );

            form.reset();

            showMessage(
                "Thanks. Your enquiry has been sent successfully.",
                "success"
            );
        } catch (error) {
            console.error("EmailJS submission error:", error);

            showMessage(
                "We could not send your enquiry. Please try again or email hello@core25.com.au.",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    });

    function setSubmitting(isSubmitting) {
        if (!submitButton) {
            return;
        }

        submitButton.disabled = isSubmitting;
        submitButton.textContent = isSubmitting
            ? "Sending..."
            : originalButtonText;
    }

    function showMessage(message, status) {
        if (!messageElement) {
            return;
        }

        messageElement.textContent = message;
        messageElement.dataset.status = status;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}
