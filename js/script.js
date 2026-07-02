window.addEventListener("scroll", () => {
    document.querySelector(".navbar")
        .classList.toggle(
            "sticky",
            window.scrollY > 50
        );
});