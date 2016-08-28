'use strict'
let main = () => {
  let smoothScroll = () => {
    let anchors = $('a[href*="#"]:not([href="#"])');
    anchors.on('click', (e) => {
      let trigger = e.currentTarget;
      if (location.pathname.replace(/^\//, '') == trigger.pathname.replace(/^\//, '') && location.hostname == trigger.hostname) {
        let target = $(trigger.hash);
        target = target.length ? target : $('[name=' + trigger.hash.slice(1) + ']');
        if (target.length) {
          $('html, body').animate({
            scrollTop: target.offset().top
          }, 1000);
          return false;
        }
      }
    });
  };

  let toggleNav = () =>{
    //click hamburger to toggle the nav
    $('.js-nav-trigger').on('click', (e)=>{
      let trigger = $(e.currentTarget);
      let icon = trigger.find('.js-nav-trigger-icon');
      let nav = $(trigger.data('target'));
      nav.toggleClass('open');
      icon.toggleClass('catif-hamburger catif-navigate-close');
    });
    //click to dismiss the nav
    $('.js-nav').on('click', (e) =>{
      let nav = $(e.currentTarget);
      let dismiss = $(nav.find('*').addBack());
      dismiss.on('click', (e) => {
        nav.removeClass('open');
      });
    });
  };

  let scrollNav = () => {
    let $window = $(window);
    let navbar = $('.navbar');
    $window.on('scroll', ()=> {
      if($window.scrollTop() > 100) {
        navbar.fadeIn(300);
      }
      else {
        navbar.fadeOut(300);
      }
    });
  };

  let scrollGoToTop = () => {
    let $window = $(window);
    let goToTop = $('.go-to-top');
    $window.on('scroll', () => {
      if($window.scrollTop() > 200) {
        goToTop.fadeIn(300);
      }
      else {
        goToTop.fadeOut(300);
      }
    });
  };
  smoothScroll();
  scrollNav();
  scrollGoToTop();
  toggleNav();
};
main();
svg4everybody(); 
