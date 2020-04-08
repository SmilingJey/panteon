(function () {
  'use strict';

  var NAV_ITEM_ACTVE_CLASS = "slider__nav-item--active";
  var SLIDE_ACTVE_CLASS = "slider__slide--active";

  var sliderNavItems;
  var sliderSlides;

  var setActiveSlide = function (active) {
    for (var i = 0; i < sliderNavItems.length; i++) {
      if (sliderNavItems[i] === active) {
        sliderNavItems[i].classList.add(NAV_ITEM_ACTVE_CLASS);
        if (i < sliderSlides.length) {
          sliderSlides[i].classList.add(SLIDE_ACTVE_CLASS);
        }
      } else {
        sliderNavItems[i].classList.remove(NAV_ITEM_ACTVE_CLASS);
        if (i < sliderSlides.length) {
          sliderSlides[i].classList.remove(SLIDE_ACTVE_CLASS);
        }
      }
    }
    /*Array.from(sliderNavItems).forEach(function(item) {
      if (item === active) item.classList.add(NAV_ITEM_ACTVE_CLASS);
      else item.classList.remove(NAV_ITEM_ACTVE_CLASS);
    });*/
  }

  var configNavItem = function(item) {
    var itemIcon = item.querySelector('.slider__item-icon');
    itemIcon.addEventListener('click', function () {
      if (item.classList.contains(NAV_ITEM_ACTVE_CLASS)) return;
      setActiveSlide(item);
    });
  }

  window.slider = {
    init: function (sliderPath) {
      var slider = document.querySelector(sliderPath);
      sliderNavItems = slider.querySelectorAll('.slider__nav-item');
      sliderSlides = slider.querySelectorAll('.slider__slide');
      Array.from(sliderNavItems).forEach(function (item) {
        configNavItem(item);
      });
    }
  }
})();

window.slider.init('.slider');
