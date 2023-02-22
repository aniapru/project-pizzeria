import { select, templates } from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.initCarousel();
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
