export default class Menu {
  toggleId = "menu-toggle";
  menuId = "menu";

  constructor() {
    const $toggle = document.getElementById(this.toggleId);
    const $menu = document.getElementById(this.menuId);

    if (!$toggle || !$menu) {
      return;
    }

    $toggle.addEventListener("click", this.toggleMenu.bind(this));

    this.$toggle = $toggle;
    this.$menu = $menu;

    this.$mediaQuery = window.matchMedia("(min-width: 40rem)");
    this.$mediaQuery.addEventListener(
      "change",
      this.checkMediaQuery.bind(this),
    );

    this.checkMediaQuery();
  }

  checkMediaQuery() {
    if (this.$mediaQuery.matches) {
      this.destroy();
      return;
    }

    this.build();
  }

  build() {
    // Set up menu
    this.$menu.setAttribute("aria-controlledby", this.toggleId);
    this.$menu.setAttribute("hidden", "hidden");

    // Set up button
    this.$toggle.setAttribute("aria-expanded", "false");
    this.$toggle.setAttribute("aria-controls", this.menuId);
    this.$toggle.removeAttribute("hidden");
  }

  destroy() {
    // Teardown menu
    this.$menu.removeAttribute("aria-controlledby");
    this.$menu.removeAttribute("hidden");

    // Teardown button
    this.$toggle.removeAttribute("aria-expanded");
    this.$toggle.removeAttribute("aria-controls");
    this.$toggle.setAttribute("hidden", "hidden");
  }

  showMenu() {
    this.$toggle.setAttribute("aria-expanded", "true");
    this.$menu.removeAttribute("hidden");
  }

  hideMenu() {
    this.$toggle.setAttribute("aria-expanded", "false");
    this.$menu.setAttribute("hidden", "hidden");
  }

  toggleMenu() {
    if (this.$toggle.getAttribute("aria-expanded") === "true") {
      this.hideMenu();
      return;
    }
    this.showMenu();
  }
}
