var MyScroll = "";
(function (window, document, $, undefined) {
  "use strict";
  var isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Nokia|Opera Mini/i.test(
      navigator.userAgent
    )
      ? !0
      : !1;
  var Scrollbar = window.Scrollbar;
  var Init = {
    i: function (e) {
      Init.s();
      Init.methods();
    },
    s: function (e) {
      (this._window = $(window)),
        (this._document = $(document)),
        (this._body = $("body")),
        (this._html = $("html"));
    },
    methods: function (e) {
      Init.w();
      Init.BackToTop();
      Init.preloader();
      Init.header();
      Init.slick();
      Init.categoryToggle();
      Init.dropdown();
      Init.filterSearch();
      Init.passwordIcon();
      Init.countdownInit(".countdown", "2024/12/01");
      Init.formValidation();
      Init.contactForm();
    },
    w: function (e) {
      if (isMobile) {
        $("body").addClass("is-mobile");
      }
    },
    BackToTop: function () {
      var scrollToTopBtn = document.querySelector(".scrollToTopBtn");
      var rootElement = document.documentElement;
      function handleScroll() {
        var scrollTotal = rootElement.scrollHeight - rootElement.clientHeight;
        if (rootElement.scrollTop / scrollTotal > 0.05) {
          scrollToTopBtn.classList.add("showBtn");
        } else {
          scrollToTopBtn.classList.remove("showBtn");
        }
      }
      function scrollToTop() {
        rootElement.scrollTo({ top: 0, behavior: "smooth" });
      }
      scrollToTopBtn.addEventListener("click", scrollToTop);
      document.addEventListener("scroll", handleScroll);
    },
    preloader: function () {
      setTimeout(function () {
        $("#preloader").hide("slow");
      }, 3000);
    },
    header: function () {
      function dynamicCurrentMenuClass(selector) {
        let FileName = window.location.href.split("/").reverse()[0];
        selector.find("li").each(function () {
          let anchor = $(this).find("a");
          if ($(anchor).attr("href") == FileName) {
            $(this).addClass("current");
          }
        });
        selector.children("li").each(function () {
          if ($(this).find(".current").length) {
            $(this).addClass("current");
          }
        });
        if ("" == FileName) {
          selector.find("li").eq(0).addClass("current");
        }
      }
      if ($(".main-menu__list").length) {
        let mainNavUL = $(".main-menu__list");
        dynamicCurrentMenuClass(mainNavUL);
      }
      if ($(".main-menu__nav").length && $(".mobile-nav__container").length) {
        let navContent = document.querySelector(".main-menu__nav").innerHTML;
        let mobileNavContainer = document.querySelector(
          ".mobile-nav__container"
        );
        mobileNavContainer.innerHTML = navContent;
      }
      if ($(".sticky-header__content").length) {
        let navContent = document.querySelector(".main-menu").innerHTML;
        let mobileNavContainer = document.querySelector(
          ".sticky-header__content"
        );
        mobileNavContainer.innerHTML = navContent;
      }
      if ($(".mobile-nav__container .main-menu__list").length) {
        let dropdownAnchor = $(
          ".mobile-nav__container .main-menu__list .dropdown > a"
        );
        dropdownAnchor.each(function () {
          let self = $(this);
          let toggleBtn = document.createElement("BUTTON");
          toggleBtn.setAttribute("aria-label", "dropdown toggler");
          toggleBtn.innerHTML = "<i class='fa fa-angle-down'></i>";
          self.append(function () {
            return toggleBtn;
          });
          self.find("button").on("click", function (e) {
            e.preventDefault();
            let self = $(this);
            self.toggleClass("expanded");
            self.parent().toggleClass("expanded");
            self.parent().parent().children("ul").slideToggle();
          });
        });
      }
      if ($(".mobile-nav__toggler").length) {
        $(".mobile-nav__toggler").on("click", function (e) {
          e.preventDefault();
          $(".mobile-nav__wrapper").toggleClass("expanded");
          $("body").toggleClass("locked");
        });
      }
      $(window).on("scroll", function () {
        if ($(".stricked-menu").length) {
          var headerScrollPos = 130;
          var stricky = $(".stricked-menu");
          if ($(window).scrollTop() > headerScrollPos) {
            stricky.addClass("stricky-fixed");
          } else if ($(this).scrollTop() <= headerScrollPos) {
            stricky.removeClass("stricky-fixed");
          }
        }
      });
    },
    slick: function () {
      if ($(".breaking-news-slider").length) {
        $(".breaking-news-slider").slick({
          infinite: true,
          slidesToShow: 1,
          arrows: !1,
          autoplay: true,
          cssEase: "linear",
          autoplaySpeed: 0,
          speed: 8000,
          variableWidth: true,
          centerMode: true,
          pauseOnFocus: !1,
          pauseOnHover: !1,
        });
      }
      if ($(".hero-slider").length) {
        $(".hero-slider").slick({
          autoplay: false,
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplaySpeed: 4000,
          arrows: !1,
          swipe: !0,
          fade: !0,
          pauseOnFocus: !1,
          pauseOnHover: !1,
          dots: !0,
        });
      }
      if ($(".blog-timeline-slider").length) {
        $(".blog-timeline-slider").slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          touchMove: true,
          autoplay: true,
          arrows: false,
          fade: true,
          focusOnSelect: true,
          asNavFor: ".blog-timeline-slider-asnav",
          infinite: true,
        });
      }
      if ($(".blog-timeline-slider-asnav").length) {
        var sliderTimer = 5000;
          var $imageSlider = $('.blog-timeline-slider-asnav');
          $imageSlider.slick({
            infinite: true,
            touchMove: true,
            swipeToSlide: true,
            swipe: true,
            vertical: true,
            verticalSwiping: true,
            focusOnSelect: true,
            autoplay: true,
            autoplaySpeed: sliderTimer,
            asNavFor: ".blog-timeline-slider",
            speed: 1000,
            arrows: false,
            dots: false,
            adaptiveHeight: true,
            pauseOnFocus: false,
            pauseOnHover: false,
          });
        
          function progressBar(){
            $('.slider-progress').find('span').removeAttr('style');
            $('.slider-progress').find('span').removeClass('active');
            setTimeout(function(){
              $('.slider-progress').find('span').css('transition-duration', (sliderTimer/1000)+'s').addClass('active');
            }, 100);
          }
          progressBar();
          $imageSlider.on('beforeChange', function(e, slick) {
            progressBar();
          });
      }
      if ($(".random-slider").length) {
        $(".random-slider").slick({
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: !0,
          autoplay: false,
          dots: !0,
          draggable: !0,
          arrows: !1,
          lazyLoad: "progressive",
          asNavFor: '.menu-row',
          speed: 800,
          autoplaySpeed: 2000,
          responsive: [
            { breakpoint: 1025, settings: { slidesToShow: 2 } },
            { breakpoint: 576, settings: { slidesToShow: 1 } },
          ],
        });
      }
      if ($(".menu-row").length) {
        $(".menu-row").slick({
          slidesToShow: 3,
          slidesToScroll: 1,
          speed: 800,
          autoplay: false,
          autoplaySpeed: 2000,
          asNavFor: '.random-slider',
          variableWidth: true,
          dots: false,
          focusOnSelect: true,
          infinite: !0,
          draggable: false,
          arrows: false,
          lazyLoad: "progressive",
          responsive: [
            { breakpoint: 1025, settings: { slidesToShow: 2 } },
          ],
        });
      }
      
      $(".btn-prev").click(function () {
        var $this = $(this).attr("data-slide");
        $("." + $this).slick("slickPrev");
      });
      $(".btn-next").click(function () {
        var $this = $(this).attr("data-slide");
        $("." + $this).slick("slickNext");
      });
    },
    categoryToggle: function () {
      if ($(".main-menu__right").length) {
        $(".notification").click(function (event) {
          event.stopPropagation();
          $(".account-menu").removeClass("active"); // Close the account menu if it's open
          $(".notification-menu").toggleClass("active");
        });
        $(document).click(function (event) {
          if (!$(event.target).closest(".notification, .notification-menu").length) {
            $(".notification-menu").removeClass("active");
          }
        });
        $(".notification-menu").click(function (event) {
          event.stopPropagation();
        });
      }
      
      if ($(".main-menu__right").length) {
        $(".account").click(function (event) {
          event.stopPropagation();
          $(".notification-menu").removeClass("active"); // Close the notification menu if it's open
          $(".account-menu").toggleClass("active");
        });
        $(document).click(function (event) {
          if (!$(event.target).closest(".account, .account-menu").length) {
            $(".account-menu").removeClass("active");
          }
        });
        $(".account-menu").click(function (event) {
          event.stopPropagation();
        });
      }


      // HEADER SEARCH START
      if ($(".logo-icon").length) {
        $("#magnifying-btn").on("click", function (event) {
          event.stopPropagation();
          $(".input-search").slideDown("fast");
        });

        $(document).on("click", function (event) {
          if (!$(event.target).closest(".search-block").length) {
            $(".input-search").slideUp("fast");
          }
        });

        $(".search-block").on("click", function (event) {
          event.stopPropagation();
        });
      }
      // HEADER SEARCH START
    },

    dropdown: function () {
      const selectedAll = document.querySelectorAll(".wrapper-dropdown");

      selectedAll.forEach((selected) => {
        const optionsContainer = selected.children[2];
        const optionsList = selected.querySelectorAll(
          "div.wrapper-dropdown li"
        );

        selected.addEventListener("click", () => {
          let arrow = selected.children[1];

          if (selected.classList.contains("active")) {
            handleDropdown(selected, arrow, false);
          } else {
            let currentActive = document.querySelector(
              ".wrapper-dropdown.active"
            );

            if (currentActive) {
              let anotherArrow = currentActive.children[1];
              handleDropdown(currentActive, anotherArrow, false);
            }

            handleDropdown(selected, arrow, true);
          }
        });

        // update the display of the dropdown
        for (let o of optionsList) {
          o.addEventListener("click", () => {
            selected.querySelector(".selected-display").innerHTML = o.innerHTML;
          });
        }
      });

      // check if anything else ofther than the dropdown is clicked
      window.addEventListener("click", function (e) {
        if (e.target.closest(".wrapper-dropdown") === null) {
          closeAllDropdowns();
        }
      });

      // close all the dropdowns
      function closeAllDropdowns() {
        const selectedAll = document.querySelectorAll(".wrapper-dropdown");
        selectedAll.forEach((selected) => {
          const optionsContainer = selected.children[2];
          let arrow = selected.children[1];

          handleDropdown(selected, arrow, false);
        });
      }

      // open all the dropdowns
      function handleDropdown(dropdown, arrow, open) {
        if (open) {
          arrow.classList.add("rotated");
          dropdown.classList.add("active");
        } else {
          arrow.classList.remove("rotated");
          dropdown.classList.remove("active");
        }
      }
    },
    filterSearch: function () {
      if ($("#searchInput").length) {
        $("#searchInput").on("keyup", function () {
          var value = $(this).val().toLowerCase();
          $(".blogs-block").filter(function () {
            var hasMatch =
              $(this).find(".blog-title").text().toLowerCase().indexOf(value) >
              -1;
            $(this).toggle(hasMatch);
          });
        });
      }
    },
    passwordIcon: function () {
      $("#eye , #eye-icon").click(function () {
        if ($(this).hasClass("fa-eye-slash")) {
          $(this).removeClass("fa-eye-slash");
          $(this).addClass("fa-eye");
          $(".password-input").attr("type", "text");
        } else {
          $(this).removeClass("fa-eye");
          $(this).addClass("fa-eye-slash");
          $(".password-input").attr("type", "password");
        }
      });
    },
    countdownInit: function (countdownSelector, countdownTime, countdown) {
      var eventCounter = $(countdownSelector);
      if (eventCounter.length) {
        eventCounter.countdown(countdownTime, function (e) {
          $(this).html(
            e.strftime(
              "<li><h2>%D</h2><h6>Days</h6></li>\
              <li><h2>%H</h2><h6>Hrs</h6></li>\
              <li><h2>%M</h2><h6>Mins</h6></li>\
              <li><h2>%S</h2><h6>Secs</h6></li>"
            )
          );
        });
      }
    },
    formValidation: function () {
      if ($(".blog-form").length) {
        $(".blog-form").validate();
      }
      if ($(".contact-form").length) {
        $(".contact-form").validate();
      }
      if ($(".login-form").length) {
        $(".login-form").validate();
      }
    },
    contactForm: function () {
      $(".contact-form").on("submit", function (e) {
        e.preventDefault();
        if ($(".contact-form").valid()) {
          var _self = $(this);
          _self
            .closest("div")
            .find('button[type="submit"]')
            .attr("disabled", "disabled");
          var data = $(this).serialize();
          $.ajax({
            url: "./assets/mail/contact.php",
            type: "post",
            dataType: "json",
            data: data,
            success: function (data) {
              $(".contact-form").trigger("reset");
              _self.find('button[type="submit"]').removeAttr("disabled");
              if (data.success) {
                document.getElementById("message").innerHTML =
                  "<h4 class='color-primary mt-16 mb-16'>Email Sent Successfully</h4>";
              } else {
                document.getElementById("message").innerHTML =
                  "<h4 class='color-primary mt-16 mb-16'>There is an error</h4>";
              }
              $("#message").show("slow");
              $("#message").slideDown("slow");
              setTimeout(function () {
                $("#message").slideUp("hide");
                $("#message").hide("slow");
              }, 4000);
            },
          });
        } else {
          return !1;
        }
      });
    },
  };
  Init.i();
})(window, document, jQuery);
