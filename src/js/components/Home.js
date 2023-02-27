import { select, templates, classNames } from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.initCarousel();
    thisHome.initSubpage();
  }

  render(element) {
    const thisHome = this;

    thisHome.dom = {};
    thisHome.dom.wrapper = element;

    const generateHTML = templates.home(element);
    thisHome.dom.wrapper.innerHTML = generateHTML;

    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector(
      select.home.carousel
    );
  }

  initSubpage() {
    const thisHome = this;

    thisHome.homeLinks = document.querySelectorAll(select.home.links);

    for (let link of thisHome.homeLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', '');
        const pages = document.querySelector(select.containerOf.pages).children;

        for (let page of pages) {
          page.classList.toggle(classNames.pages.active, page.id == id);
        }

        const navLinks = document.querySelectorAll(select.nav.links);

        for (let link of navLinks) {
          link.classList.toggle(
            classNames.nav.active,
            link.getAttribute('href') == '#' + id
          );
        }
        window.location.hash = '#/' + id;
      });
    }
  }

  initCarousel() {
    const thisHome = this;

    // eslint-disable-next-line no-undef
    thisHome.carousel = new Flickity(thisHome.dom.carousel, {
      wrapAround: true,
      autoPlay: true,
      prevNextButtons: false,
    });
  }
}

export default Home;
