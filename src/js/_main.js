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

    let toggleNav = () => {
        //click hamburger to toggle the nav
        $('.js-nav-trigger').on('click', (e) => {
            let trigger = $(e.currentTarget);
            let icon = trigger.find('.js-nav-trigger-icon');
            let nav = $(trigger.data('target'));
            nav.toggleClass('open');
            icon.toggleClass('catif-hamburger catif-navigate-close');
        });
        //click to dismiss the nav
        $('.js-nav').on('click', (e) => {
            let nav = $(e.currentTarget);
            let dismiss = $(nav.find('*').addBack());
            dismiss.on('click', (e) => {
                nav.removeClass('open');
            });
        });
    };


    let scrollGoToTop = () => {
        let $window = $(window);
        let goToTop = $('.go-to-top');
        $window.on('scroll', () => {
            if ($window.scrollTop() > 200) {
                goToTop.fadeIn(300);
            } else {
                goToTop.fadeOut(300);
            }
        });
    };

    let openStatus = (target, range) => {
        let currentTime = new Date();
        let currentTimeNumeric = parseFloat(currentTime.getHours()) + parseFloat((currentTime.getMinutes() / 60));
        let rangeNumeric = [parseFloat(range.split('-')[0].split(':')[0]) + parseFloat((range.split('-')[0].split(':')[1] / 60)), parseFloat(range.split('-')[1].split(':')[0]) + parseFloat((range.split('-')[1].split(':')[1] / 60))];
        if (currentTimeNumeric < rangeNumeric[0] || currentTimeNumeric > rangeNumeric[1]) {
            target.text('Closed now');
        } else {
            target.text("Open now");
        }
    };

    smoothScroll();
    scrollGoToTop();
    toggleNav();
    svg4everybody();
    openStatus($('#openStatus'),'9:30-22:00');
};
main();
