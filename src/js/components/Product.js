import { select, classNames, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    //console.log('new Product:', thisProduct);
  }

  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on template */

    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */

    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */

    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */

    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(
      select.menuProduct.clickable
    );

    thisProduct.form = thisProduct.element.querySelector(
      select.menuProduct.form
    );

    thisProduct.formInputs = thisProduct.form.querySelectorAll(
      select.all.formInputs
    );

    thisProduct.cartButton = thisProduct.element.querySelector(
      select.menuProduct.cartButton
    );

    thisProduct.priceElem = thisProduct.element.querySelector(
      select.menuProduct.priceElem
    );

    thisProduct.imageWrapper = thisProduct.element.querySelector(
      select.menuProduct.imageWrapper
    );

    thisProduct.amountWidgetElem = thisProduct.element.querySelector(
      select.menuProduct.amountWidget
    );
  }

  initAccordion() {
    const thisProduct = this;

    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */

      const activeProduct = document.querySelector(
        select.all.menuProductsActive
      );
      //console.log(activeProduct);

      /* if there is active product and it's not thisProduct.element, remove class active from it */

      if (activeProduct != null && activeProduct != thisProduct.element) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }

      /* toggle active class on thisProduct.element */

      thisProduct.element.classList.toggle(
        classNames.menuProduct.wrapperActive
      );
    });
  }

  initOrderForm() {
    const thisProduct = this;
    //console.log('initOrderForm');

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;
    //console.log('processOrder');

    // convert form to object structure e.g. {sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'...}
      const param = thisProduct.data.params[paramId];
      //console.log(paramId, param);

      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives", price: 2, default: true }
        const option = param.options[optionId];
        //console.log(optionId, option);

        // check if option is chosen
        const optionSelected =
          //formData[paramId] && formData[paramId].includes(optionId);
          formData[paramId]?.includes(optionId);

        if (optionSelected) {
          //console.log('Wybrano!');
          // chceck if option is not default
          if (!option.default) {
            // reduce price variable
            price += option.price;
          }
        } else {
          //check if option is default
          if (option.default) {
            //reduce price variable
            price -= option.price;
          }
        }

        // find img with class .paramId-optionId
        const optionImage = thisProduct.imageWrapper.querySelector(
          `.${paramId}-${optionId}`
        );
        //console.log(optionImage);

        // check if img is found
        if (optionImage) {
          // check if the option is chosen
          if (optionSelected) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    // price of single product
    thisProduct.priceSingle = price;

    // multiply price by amount
    price *= thisProduct.amountWidget.value;

    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  addToCart() {
    const thisProduct = this;

    // app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);

    /* reset widget after adding product to cart
    thisProduct.amountWidget.setValue(settings.amountWidget.defaultValue);
    thisProduct.processOrder();
    console.log(thisProduct.priceElem.innerHTML); */
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParam(),
    };

    return productSummary;
  }

  prepareCartProductParam() {
    const thisProduct = this;

    // convert form to object structure e.g. {ingredients : ['cucmber', 'tomatoes']}
    const formData = utils.serializeFormToObject(thisProduct.form);

    const params = {};

    // for every category (param)
    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      //console.log(paramId, param);

      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {
        label: param.label,
        options: {},
      };

      // for every option in this category
      for (let optionId in param.options) {
        const option = param.options[optionId];
        // console.log(optionId, option);

        const optionSelected =
          formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {
          params[paramId].options[optionId] = option.label;
        }
      }
    }

    return params;
  }
}

export default Product;
