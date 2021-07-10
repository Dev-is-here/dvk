var theme = (function() {

    "use strict";

    /* Run scripts
     -------------------------------- */

    // If document is ready VJS
    document.addEventListener("DOMContentLoaded", function() {
        theme.init();
    });

    return {

        globals : {
            isTouch : false,
            isMobile : false,
            lightMode : false,
            path : themeVars.path,
        },
        

        /* Init
         -------------------------------- */
        init: function() {
            this.tools.init();
            this.menu.init();

            // FX
            this.fx.init();
            this.tiltFX.init();
            this.cursor.init();
            this.magnet.init('.magneto,.header__logo a,input[type="submit"], .custom-menu ul li a');
            this.smoothScroll.init();

            this.prototypes();
            this.events.init();

            // Small Helpers
            this.helpers.scrollTop();
            this.helpers.sidebar();

            // Plugins
            this.plugins.lazy();
            this.plugins.disqus();
            
            // AX Loader
            this.AXloader.init();
            
        },

        reload: function() {

            // FX
            this.fx.init();
            this.tiltFX.init();
            this.cursor.update('#ajax-content a[href], #ajax-content input[type="submit"]');
            this.magnet.update('.magneto,input[type="submit"], .custom-menu ul li a');

            this.smoothScroll.update();

            this.helpers.sidebar();


            this.plugins.lazy();
            this.plugins.disqus();
        },

        visible : function(){
            // Add to body visible class
            document.body.classList.add('is-visible');

            // Update events when page is visible
            this.events.update();

        },


        /* ==================================================
          Tools
        ================================================== */

        tools : {

            init : function() {
                let tools = theme.tools;
                tools.checkMobile();
                tools.checkIE();
                tools.checkCssMixBlend();
            },
            checkMobile: function() {
                if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) {
                    document.querySelector('html').classList.add('is-mobile');
                    theme.globals.isMobile = true;
                } else {
                    document.querySelector('html').classList.add('no-mobile');
                }
                if (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
                    document.querySelector('html').classList.add('is-touch');
                    theme.globals.isTouch = true;
                } else {
                    document.querySelector('html').classList.add('no-touch');
                }
              
            },
            checkIE : function() {
                if (/MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent)  ) {
                    // This is internet explorer 10
                    document.querySelector('html').classList.add('is-ie','ie-old');
                    theme.globals.lightMode = true;
                }
                if (/rv:11.0/i.test(navigator.userAgent)) {
                    // This is internet explorer 9 or 11
                    document.querySelector('html').classList.add('is-ie','ie-11');
                    theme.globals.lightMode = true;
                }
                if (/Edge\/\d./i.test(navigator.userAgent)){
                   // This is Microsoft Edge
                   document.querySelector('html').classList.add('is-ie','ie-edge');
                   theme.globals.lightMode = true;
                }
            },

            checkCssMixBlend : function() {
                if (typeof window.getComputedStyle(document.body).mixBlendMode === 'undefined') {
                    document.querySelector('html').classList.add("mix-blend-mode-no");
                }
            }

        },


        /* ==================================================
          Theme FX
        ================================================== */
        fx : {

            plane : null,
            planes : null,

            init :  function() {


                // Kill listeners
                theme.fx.kill();

                // If 3D FX are enabled in theme panel
                if (typeof threeFX !== "undefined") {

                    // Run effects
                    threeFX.glitchGL.init();
                    threeFX.glitchSlider.init();

                }

                // Light mode
                if ( theme.globals.lightMode || theme.globals.isTouch ||  theme.globals.isMobile ) {
                    return;
                }

                // Perspective FX
                if ( document.querySelector( '.fx-perspective .fx-perspective__image') ) {
                    theme.fx.plane = document.querySelector( '.fx-perspective .fx-perspective__image' );
                    addEventListener('mousemove', theme.fx.perspective, false );
                }

                // Smooth Move FX
                if ( document.querySelector( '.fx-smooth-move-layer') ) {

                    theme.fx.planes = document.querySelectorAll( '.fx-smooth-move-layer' );
                    for( let plane of theme.fx.planes ) {
                        plane.moveX = 40;
                        plane.moveY = 40;
                        if ( plane.getAttribute('data-move-x') ) {
                            plane.moveX = parseFloat(plane.getAttribute('data-move-x'));
                        }
                        if ( plane.getAttribute('data-move-y') ) {
                            plane.moveY = parseFloat(plane.getAttribute('data-move-y'));
                        }
                       
                    }   

                    addEventListener('mousemove', theme.fx.smoothMove, false );
                }

            },


            perspective : function(e) {

                var decimalX = e.clientX / window.innerWidth - 0.5;
                var decimalY = e.clientY / window.innerHeight - 0.5;
                gsap.to(theme.fx.plane, 1, { rotationY: 10 * decimalX, rotationX: 10 * decimalY, ease: Quad.easeOut, transformPerspective: 900, transformOrigin: "center" });
                gsap.to(theme.fx.plane, 1, { y: 40 * decimalY, x: 40 * decimalX, ease: 'power3.out' });
            },

            smoothMove : function(e) {
                var decimalX = e.clientX / window.innerWidth - 0.5;
                var decimalY = e.clientY / window.innerHeight - 0.5;
                
                for( let plane of theme.fx.planes ) {
                    gsap.to(plane, 1, { y: plane.moveY * decimalY, x: plane.moveX * decimalX, ease: 'power3.out' });
                }
                
            },

            kill : function() {
                theme.fx.planes = null;
                removeEventListener('mousemove', theme.fx.perspective, false );
                removeEventListener('mousemove', theme.fx.smoothMove, false );

            }            

        },

        tiltFX : {

            plane : null,
            img : null,
            title : null,
            mousetime : null,
            allowTilt : false,

            init : function(){

                // Light mode
                if ( theme.globals.lightMode ) {
                    return;
                }

                let fx = theme.tiltFX;

                const thumbs = document.querySelectorAll('.ithumb-perspective');
                for ( let thumb of thumbs ) {
                    thumb.addEventListener('mouseenter', fx.mouseenterFn);
                    thumb.addEventListener('mousemove', fx.mousemoveFn);
                    thumb.addEventListener('mouseleave', fx.mouseleaveFn);
                }   

            },

            mouseenterFn : function(ev) {
                let fx = theme.tiltFX;
                clearTimeout(fx.mousetime);
                
                fx.plane = ev.target;
                fx.img = ev.target.querySelector( '.ithumb-perspective__img' );
                fx.title = ev.target.querySelector( '.ithumb-perspective__title' );
                fx.allowTilt = true;
                fx.mousetime = setTimeout(() => {
                    // Scale the image.
                    gsap.to(fx.img, 0.8, {
                        ease: Power3.easeOut,
                        scale: 1.1
                    });
                }, 40);
            },

            mousemoveFn : function(ev) {
                let fx = theme.tiltFX;
                if ( fx.allowTilt === false ) {
                    return;
                }
                requestAnimationFrame(() => {
                    fx.tilt(ev);
                });
            },
            mouseleaveFn : function(ev) { 
                let fx = theme.tiltFX;

                let p = ev.target;
                let img = ev.target.querySelector( '.ithumb-perspective__img' );
                let t = ev.target.querySelector( '.ithumb-perspective__title' );

                requestAnimationFrame(() => {
                    clearTimeout(fx.mousetime);
                    // Reset tilt and image scale.
                    gsap.to([p, t], 1.8, {
                        ease: 'Power4.easeOut',
                        x: 0,
                        y: 0,
                        rotationX: 0,
                        rotationY: 0
                    });
                    gsap.to(img, 0.8, {
                        ease: 'Power4.easeOut',
                        scale: 1
                    });
                });
         
            },

            getMousePos : function(e) {
                let posx = 0;
                let posy = 0;
                if (!e) e = window.event;
                if (e.pageX || e.pageY)     {
                    posx = e.pageX;
                    posy = e.pageY;
                }
                else if (e.clientX || e.clientY)    {
                    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }
                return { x : posx, y : posy }
            },

            tilt : function(ev) {
                let fx = theme.tiltFX;

                const mousepos = fx.getMousePos(ev);
                // Document scrolls.
                const docScrolls = {
                    left : document.body.scrollLeft + document.documentElement.scrollLeft, 
                    top : document.body.scrollTop + document.documentElement.scrollTop
                };
                const bounds = fx.plane.getBoundingClientRect();
                // Mouse position relative to the main element (this.DOM.el).
                const relmousepos = { 
                    x : mousepos.x - bounds.left - docScrolls.left, 
                    y : mousepos.y - bounds.top - docScrolls.top 
                };
                
                // Move the element from -20 to 20 pixels in both x and y axis.
                // Rotate the element from -15 to 15 degrees in both x and y axis.
                let t = {x:[-20,20],y:[-20,20]},
                    r = {x:[-15,15],y:[-15,15]};

                const transforms = {
                    translation : {
                        x: (t.x[1]-t.x[0])/bounds.width*relmousepos.x + t.x[0],
                        y: (t.y[1]-t.y[0])/bounds.height*relmousepos.y + t.y[0]
                    },
                    rotation : {
                        x: (r.x[1]-r.x[0])/bounds.height*relmousepos.y + r.x[0],
                        y: (r.y[1]-r.y[0])/bounds.width*relmousepos.x + r.y[0]
                    }
                };

                // Move the image wrap.
                gsap.to(fx.plane, 1.5, {
                    ease: 'Power1.easeOut',
                    x: transforms.translation.x,
                    y: transforms.translation.y,
                    rotationX: transforms.rotation.x,
                    rotationY: transforms.rotation.y
                }); 
                // Move the texts wrap.
                gsap.to(fx.title, 1.5, {
                    ease: 'Power1.easeOut',
                    x: -1*transforms.translation.x,
                    y: -1*transforms.translation.y
                }); 
              
            },

            kill : function() {
                removeEventListener('mouseenter', fx.mouseenterFn);
                removeEventListener('mousemove', fx.mousemoveFn);
                removeEventListener('mouseleave', fx.mouseleaveFn);

            },

        },


        /* ==================================================
          AXloader 
        ================================================== */
        AXloader: {

            init: function() {
                
                if ( themeVars.ajaxed === '0' ) {
                    theme.visible();
                    return;
                }
                let reloadContainers   = theme.AXloader.ajaxSplit( themeVars.reloadContainers );
                let blacklistLinks     = theme.AXloader.ajaxSplit( themeVars.blacklistLinks );
                let blacklistSelectors = theme.AXloader.ajaxSplit( themeVars.blacklistSelectors );
                let reloadScripts      = theme.AXloader.ajaxSplit( themeVars.reloadScripts );
                let permalinks         = (themeVars.permalinks === 1) ? true : false;
                
                AXloader.init({
                    baseUrl           : themeVars.baseUrl,
                    dir               : themeVars.dir,
                    reloadContainers  : reloadContainers,
                    permalinks        : permalinks,
                    blacklistSelectors: blacklistSelectors,
                    blacklistLinks    : blacklistLinks,
                    reloadScripts     : reloadScripts,
                    jsFragments       : ['var wpcf7','{"@context"'],
                    searchForms       : '#searchform',
                    startDelay        : 1200,
                    callbacksWait     : true,
                    nav               : '.menu-top',
                    headerContainer   : '#header',
                    progress          : theme.AXloader.loadProgress,
                    start             : theme.AXloader.loadStart,
                    startJS           : theme.AXloader.startJS,
                    end               : theme.AXloader.loadEnd,
                    redirect          : theme.AXloader.redirectStart,
                    scroll            : theme.AXloader.scroll,

                });

            },

            ajaxSplit :  function( a ) {
                if ( a === '' ) {
                      return [];  
                } else {
                      return a.split(',');
                }
            },
            
            loadProgress: function() {
                let progress = this;
                let bar = document.querySelector('.loader__progress');
                if ( bar ) {
                    bar.style.width = progress + '%';
                }
            },

            scroll : function(data) {
                let pos = 0;
                if ( data.el !== 0 ) {
                    pos = data.el.getBoundingClientRect().top + window.scrollY - data.offset
                }
                
                if ( isNaN( pos ) === false ) {
                    if ( theme.smoothScroll.scrollbar ) {
                        let s = theme.smoothScroll.scrollbar;
                        s.scrollTo(0, pos, 0);
                    } else { 
                        theme.helpers.scrollToPos(pos, 0, 0);
                   }
                }
            },
            loadStart: function(callback) {
                let html = document.querySelector('html');
                let ax = theme.AXloader;
                let delay = 0;
                let enableLoader = true;

                // FX Holder
                let holder = document.querySelector('#fx-load-holder');

                // Add body classes
                html.classList.add('ax--loading');

                // First load
                if ( this.firstLoad ) {
                    html.classList.add('ax--firstload');
                    ax.loadStartCommon( () => {
                        callback();
                    }, 0);

                } else {

                    // If are any FXs
                    let trigger = null;
                    if ( theme.globals.lightMode === false && this.trigger !== null && this.trigger !== false && this.trigger.classList.contains('fx-load') ) {
                        trigger = this.trigger;

                        // Full screen image
                        let img = trigger.parentNode.querySelector('.fx-load-img');

                        // Clear
                        holder.removeAttribute('style');

                        if ( img ) {

                            // FX Load
                            // 
                            // Full Size image effect
                            if ( trigger.classList.contains('fx-load-fz') ) {
                                // Disable loader because window is filled with an image
                                enableLoader = false;

                                let imgRect = img.getBoundingClientRect();
                                let src = img.src;

                                // Add new
                                gsap.set(holder, {
                                    visibility: 'visible', 
                                    top: imgRect.y + 'px', 
                                    left: imgRect.x + 'px', 
                                    width: imgRect.width + 'px', 
                                    height: imgRect.height + 'px',
                                    backgroundImage: "url('"+src+"')"
                                });

                                gsap.to(holder, {duration: 0.5, top: 0, left:0, width: '100vw', height: '100vh', ease: 'power3.out'});
                                if ( trigger.classList.contains('fx-load-scroll-after') ) {
                                    holder.classList.add('fx-load-scroll-after');
                                }
                                
                                holder.classList.add('fx-load-ready');
                                    
                            }

                            // Fit image size effect
                            if ( trigger.classList.contains('fx-load-fi') ) {
                                
                                let triggerRect = trigger.getBoundingClientRect();
                                let src = img.src;

                                // Add new
                                gsap.set(holder, {
                                    visibility: 'visible', 
                                    top: triggerRect.y + 'px', 
                                    left: triggerRect.x + 'px', 
                                    width: triggerRect.width + 'px', 
                                    height: triggerRect.height + 'px',
                                    backgroundImage: "url('"+src+"')"
                                });

                                let onCenter = {
                                    xPercent:-50, 
                                    yPercent:-50, 
                                    left:"50%", 
                                    top:"50%",
                                };
                                gsap.to(holder, {
                                    duration: 0.5, 
                                    xPercent:0, 
                                    yPercent:0, 
                                    top: triggerRect.y + 'px', 
                                    left: triggerRect.x + 'px', 
                                    width: triggerRect.width, 
                                    height: triggerRect.height,
                                    ease: 'power3.out'
                                 });
                           
                                if ( trigger.classList.contains('fx-load-scroll-after') ) {
                                    holder.classList.add('fx-load-scroll-after');
                                }
                                
                                holder.classList.add('fx-load-ready', 'fx-load-fi');
                            }
 
                        }

                    } 

                    // If layer menu is open set delay at 1s
                    if ( document.querySelector('.menu-button--open') ) {
                        delay = 1;
                    }   
                    theme.menu.closeMenuLayer();

                    if ( enableLoader === true ) {
                        ax.showLoader();

                        ax.loadStartCommon( () => {
                            callback();
                        }, delay);
                    } else {

                        ax.loadStartCommon( () => {
                            callback();
                        }, delay);
                    }

                }

            },

            loadStartCommon: function(callback, timer = 0){

                // Sidebar
                const sidebar = document.querySelector('.is-sidebar-ready #sidebar');
                if ( sidebar ) {
                    document.body.classList.remove('is-sidebar-ready', 'is-sidebar-open');
                    setTimeout(()=>{ sidebar.parentNode.removeChild(sidebar)}, 400);
                }

                // Remove Menu hover clases
                const menu = document.querySelector('.menu-top');
                if ( menu ) {
                    menu.classList.remove('is-hover');
                }

                // Search field
                if ( document.querySelector('#s') ) {
                    document.querySelector('#s').value = '';
                }

                /* Fire Event */
                document.dispatchEvent(new CustomEvent('AXStart', {'type': 'AX' }));

                // Timer in second
                timer = timer * 1000;
                setTimeout( () => {
                    // Callback
                    if (callback && typeof(callback) === "function") {
                        callback();
                    }
                }, timer )
            },

            startJS: function() {

                /* Fire Event */
                document.dispatchEvent(new CustomEvent('AXStartJS', {'type': 'AX' }));
            },

            loadEnd: function(callback) {

                let doVisible = true;
                let html = document.querySelector('html');
                // FX
                let holder = document.querySelector('#fx-load-holder');
                let fxDelay = 0;

                // Toggle fullscreen class
                if (document.body.classList.contains('is-fullscreen') ) {
                    document.documentElement.classList.add('is-fullscreen');
                } else {
                    document.documentElement.classList.remove('is-fullscreen');
                }

                // First Load
                if ( html.classList.contains('ax--firstload') ) {

                    gsap.set('#header', {visibility: 'visible', opacity: 1, delay:0.5 });

                    gsap.to('.loader__progress', {opacity: 0, duration: 0.3, delay:0.5, ease: 'power3.out'});
                    gsap.to('.loader__image', {scale: 1.2, opacity: 0, duration: 0.3, delay: 0.4, ease: 'power3.out'});
                    gsap.from('.header__logo', {duration: 0.3, y:-30, opacity: 0, delay: 0.5, ease: 'power3.out'} );

                    // Loader 
                    gsap.to('.loader', {opacity: 0, duration:0.5, delay: 1.3, ease: 'power3.out', onComplete:function(){
                        gsap.set('.loader', {visibility:'hidden'});
                        if ( doVisible === true ) {
                            theme.visible();
                        }
                    }});
                    
                    // Nav
                    let button_delay = 0.6;
                    if ( document.querySelector(".menu-top.classic") ) {
                        button_delay = 1;
                    }
                    if ( theme.globals.isTouch || theme.globals.isMobile ) {
                        button_delay = 0.6
                    }
                    var tl = gsap.timeline({repeat: 0, repeatDelay: 0, delay:0.6});
                    tl.staggerFrom(".menu-top div > ul > li > a", 0.5, {opacity:0, y:-100, ease: 'power3.out'}, 0.1);
                    gsap.from('.menu-button', {duration: 0.3, scale:0, opacity: 0, delay: button_delay, ease: 'power3.out'} );
                    
                    // Remove firstload class
                    gsap.set('body',{delay: button_delay, onComplete: function(){
                         html.classList.remove('ax--firstload');
                    }});

                } else {

                    /* Reload theme scripts */
                    theme.reload();

                    // If are any FXs
                    if ( theme.globals.lightMode === false ) {
                        if ( holder.classList.contains('fx-load-ready') ) {

                            document.body.classList.add('is-fx-load');
                            
                            if ( holder.classList.contains('fx-load-fi') ) {
                                let img = document.querySelector('.fx-load-fi-target');
                                if ( img ) {

                                
                                    let imgRect = img.getBoundingClientRect();
                                    let src = img.src;

                                     gsap.to(holder, {
                                        duration: 0.8,
                                        xPercent:0, 
                                        left:imgRect.x + 'px', 
                                        yPercent:0, 
                                        top:imgRect.y + 'px', 
                                        x:0, 
                                        y:0, 
                                        width: imgRect.width, 
                                        height: imgRect.height, 
                                        ease: 'power2.out'
                                    });

                                    // Set delay to clear holder styles
                                    fxDelay = 600;
                                }
                                
                            }

                        }
                    }

                    if ( doVisible === true ) {
                        
                        // Remove Holder effects
                        setTimeout(() => {

                            // hide Loader 
                            gsap.to('.loader', {opacity: 0, duration:0.5, delay: 0, ease: 'power3.out', onComplete: function() {
                                holder.removeAttribute('style');
                                holder.classList.remove('fx-load-ready');
                                // Scroll
                                if ( holder.classList.contains('fx-load-scroll-after') ) {
                                    theme.helpers.scrollToPos(100, 1, 100);
                                    holder.classList.remove('fx-load-scroll-after');
                                }
                                gsap.set('.loader', {visibility:'hidden'});
                                theme.visible();
                            }});


                        }, fxDelay);

                    }


                }
                
                
                html.classList.remove('ax--loading');

                /* Fire Event */
                document.dispatchEvent(new CustomEvent('AXEnd', {'type': 'AX' }));

                // Callback
                if (callback && typeof(callback) === "function") {
                    callback();
                }
            },

            redirectStart: function(url) {
           
                if ( url !== false && url !== undefined ) {
                    window.location.href = url;
                }
              
            },

            showLoader : function() {

                if ( document.body.classList.contains('is-loader') ) {
                    // Loader
                    gsap.set('.loader', {visibility:'visible', onComplete: function(){
                        gsap.to('.loader', {opacity: 1, duration:0.5, ease: 'power3.out'});
                    }});

                }

            },

        },


        /* ==================================================
          Navigation 
        ================================================== */
        menu: {
            init: function() {
                theme.menu.dropdown();
                theme.menu.menuSlide();
                theme.menu.menuButton();
            },
            dropdown: function() {
                const m = theme.menu;
                const ul = document.querySelectorAll('.menu-top ul li');
                for ( let li of ul ) {
                    li.data = {};
                    li.addEventListener('mouseenter', m.showChildren );
                    li.addEventListener('mouseleave', m.hideChildren );
                    li.addEventListener('click', m.hideChildren );    
                }
                
            },
            showChildren : function(e) {
                let li = this;
                let ul = li.querySelector('ul');
                const menu = document.querySelector('.menu-top');
                menu.classList.add('is-hover');

                if ( ul ) {
                    li.classList.add('active');

                    if ( li.data.timer ) {
                        clearTimeout(li.data.timer);
                    }
                     ul.style.display = 'block';
                    li.data = {showTimer: setTimeout(function() {
                       
                        gsap.to(ul, {opacity: 1, x: 0, duration: 0.3, ease: 'power1.out'});
                    }, 50)}

                    let rect = ul.getBoundingClientRect();
                    let posLeft = rect.left;
                    let width = rect.width;
                    let windowWidth = window.innerWidth;
                    let isEntirelyVisible = (posLeft + width <= windowWidth);
                    
                    if ( li.classList.contains('super-menu') === false ) {
                        if ( ! isEntirelyVisible ) {
                            ul.classList.add('edge');
                        } else {
                            ul.classList.remove('edge');
                        }
                    }
                }
            },
            hideChildren : function(e) {
                const menu = document.querySelector('.menu-top');
                menu.classList.remove('is-hover');

                let li = this;
                if ( li.data.showTimer ) {
                    clearTimeout(li.data.showTimer);
                }
                li.data = {timer: setTimeout(function() {
                        let ul = li.querySelector('ul');
                        if ( ul ) {
                            gsap.to(ul, {opacity: 0, x: 0, duration: 0.3, ease: 'power1.out', onComplete: function(){
                                li.classList.remove('active');
                                ul.classList.remove('show-list');
                                ul.classList.remove('edge');
                                ul.style.display = "none";
                            }});
                        }
                }, 300)}

            },
            menuButton: function() {
                let button = document.querySelector('.menu-button');
                button.addEventListener( 'click', e => {
                    // Prevent link default
                    e.preventDefault();
                    if ( button.classList.contains( 'menu-button--open' )) {
                        theme.menu.closeMenuLayer();
                    } else {
                       theme.menu.openMenuLayer();
                    }
                });
         
            },

            openMenuLayer : function() {
                let button = document.querySelector('.menu-button');
                if ( button.classList.contains( 'menu-button--open' ) === false ) {
                    gsap.set('.menu-layer', {visibility:'visible', onComplete: function(){
                        gsap.to('.menu-layer', {opacity: 1, duration:0.5, ease: 'power3.out'});
                        var tl = gsap.timeline({repeat: 0, repeatDelay: 0, delay:0.4});
                        tl.staggerFrom(".menu-main div > ul > li", 0.5, {opacity:0, top:100, ease: 'power3.out'}, 0.1);
                        button.classList.add('menu-button--open');
                        document.body.classList.add('menu-open');
                    }});
                }
            },

            closeMenuLayer : function() {
                let button = document.querySelector('.menu-button');
                if ( button.classList.contains( 'menu-button--open' )) {
                    var tl = gsap.timeline({onComplete: function(){
                        button.classList.remove('menu-button--open');
                        document.body.classList.remove('menu-open');
                        gsap.set('.menu-layer', {visibility:'hidden'});
                        gsap.set('.menu-main div > ul > li', {opacity:1, top:0});

                        // Close menu if is opened
                        let menu = document.querySelectorAll('.menu-main div > ul ul.is-open');

                        if ( menu.length > 0 ) {
                            for (let ul of menu ) {
                                ul.classList.remove('is-open');
                                gsap.set(ul, {height:0, opacity:0, visibility:'hidden'});
                            }
                        }
                    }, repeat: 0, repeatDelay: 0, delay:0});

                    tl.staggerTo(".menu-main div > ul > li", 0.5, {opacity:0, top:-100, ease: 'power3.out'}, 0.1, );
                    tl.to('.menu-layer', {opacity: 0, duration:0.5, ease: 'power3.out' });
                }
            },

            menuSlide: function() {
                let menu = document.querySelectorAll('.menu-main div > ul > li > a ');
                if ( menu ) {

                    for( let link of menu ) {
                        let li = link.parentNode;
                        if ( li.querySelector('ul') ){
                            let ul = li.querySelector('ul');
                            let slideTrigger = link;

                            if ( link.getAttribute('href') !== '#' ) {
                                slideTrigger = document.createElement('a');
                                slideTrigger.setAttribute('class','menu-main__toggle');
                                slideTrigger.setAttribute('href','#');
                                li.insertBefore(slideTrigger,link.nextSibling);
                            }
                           
                            slideTrigger.addEventListener('click', e => {
                                if ( ul.classList.contains('is-open') ) {
                                    gsap.to(ul, {height: 0, opacity:0, duration:0.5, ease: 'power3.out', onComplete:function(){
                                        gsap.set(ul, {visibility:'hidden'});
                                        ul.classList.remove('is-open');
                                    }});
                                } else {
                                    gsap.set(ul, {visibility:'visible', onComplete: function(){
                                        gsap.to(ul, {height: 'auto', opacity:1, duration:0.5, ease: 'power3.out'});
                                        ul.classList.add('is-open');
                                    }});
                                     
                                   
                                }
                            });
                          
                        }
                    }

                }

            },

        },


        /* ==================================================
          Cursor Actions
        ================================================== */
        cursor : {
            mouse : { x: 0, y: 0 },
            pos : { x: 0, y: 0 },
            ratio : 0.15,
            ball : document.querySelector('#cursor'),
            init :  function() {
                if ( document.body.classList.contains("is-cursor-effects") ) {
                    if ( ! theme.globals.isTouch || ! theme.globals.isMobile ) {
                        let c = theme.cursor;
                        gsap.set(c.ball, { xPercent: -50, yPercent: -50 });
                        document.addEventListener("mousemove", c.mouseMove);
                        gsap.ticker.add( c.updatePosition );
                 
                        // Hover actions
                        c.hoverables('a[href], .fx-cursor, input[type="submit"]');

                        // Remove cursor old actions classes 
                        document.addEventListener('click', e => {
                            c.ball.classList = '';
                        });
                    }
                }
            },
            updatePosition : function() {
                let c = theme.cursor;
                c.pos.x += (c.mouse.x - c.pos.x) * c.ratio;
                c.pos.y += (c.mouse.y - c.pos.y) * c.ratio;
                gsap.set(c.ball, { x: c.pos.x, y: c.pos.y });
                
            },
            mouseMove : function(e) {
                let c = theme.cursor;
                c.mouse.x = e.clientX;
                c.mouse.y = e.clientY;
            },
            hoverables : function(sel) {
                let c = theme.cursor;
                let hoverables = document.querySelectorAll(sel);
                let extraClass = null;
                let cursorBody = document.querySelector('.cursor__body-inner');
                var state = null;
                
                let hoverImages = document.querySelectorAll('.fx-hover-image');
                if ( hoverImages.length > 0 ) {
                    // Add special holder for images preview
                    var imgHolder = document.querySelector('.cursor__body-image');

                    if ( imgHolder === null ) {

                        imgHolder = document.createElement('img');
                        imgHolder.className = 'cursor__body-image';
                        cursorBody.appendChild(imgHolder);
                    }
                 
                }

                // Listeners
                for (let i = 0; i < hoverables.length; i++) {

                    hoverables[i].addEventListener('mouseenter', e => {
                        let t = e.target;
                        if ( t.classList.contains('fx-cursor') ) {

                            if ( t.getAttribute('data-cursor-class') ) {
                                extraClass = t.getAttribute('data-cursor-class');
                            }
                            if ( t.classList.contains('fx-cursor-close') ) {
                                extraClass = 'close';
                            }
                            c.ball.classList.add(extraClass);
                            if ( t.classList.contains('fx-hover-image') ) {
                                let imgHover = t.querySelector('img');
                                imgHolder.src = imgHover.src;
                                gsap.set(imgHolder, {visibility: 'visible'});
                                gsap.set(imgHolder, {opacity: 0});
                                gsap.to(imgHolder, {opacity: 1, duration: 0.3, ease: 'power3.out'});
                            }
                        } else {
                            extraClass = null;
                            c.ball.classList.add('hover');
                        }
                        state = 'over';
                        
                    });

                    hoverables[i].addEventListener('mouseleave', e => {
                        let t = e.target;
                        c.ball.classList = '';
                        if ( t.classList.contains('fx-hover-image') ) {
                             let imgHover = t.querySelector('img');
                            
                             setTimeout( e => {
                                if ( imgHolder.src == imgHover.src && state === 'out' ) {
                                    gsap.set(imgHolder, {visibility: 'hidden' });      
                                }
                                state = 'out'
                            },300);
                            gsap.to(imgHolder, {opacity: 0, duration: 0.3, ease: 'power3.out'});
                            
                        }
                       
                    });
                }
            },
            update: function(sel) {
                if ( document.body.classList.contains("is-cursor-effects") ) {
                    if ( ! theme.globals.isTouch || ! theme.globals.isMobile  ) {
                        let ballImage = theme.cursor.ball.querySelector('.cursor__body-image');
                        if (ballImage) {
                            ballImage.removeAttribute('style');
                        }
                     
                            theme.cursor.hoverables(sel);
                    }
                }
            }
        },


        /* ==================================================
          Magnet Effect 
        ================================================== */
        magnet : {
            ball : document.querySelector('#cursor'),
            mouse : { x: 0, y: 0 },
            active : false,
            pos : { x: 0, y: 0 },
            animSpeed : 0.5,
            movmentSpeed : 3,
            targetBorder : 20,
            init : function(sel){

                // Light mode
                if ( theme.globals.lightMode ) {
                    return;
                }
                if ( ! theme.globals.isTouch || ! theme.globals.isMobile  ) {
                    if ( document.body.classList.contains("is-cursor-effects") ) {
                        let m = theme.magnet;
                        document.addEventListener("mousemove", m.mouseMove);
                        m.create(sel);
                    }
                }
            },
            create : function(sel) {
                let m = theme.magnet;
                let magnets = document.querySelectorAll(sel);

                for ( let magnet of magnets ) {
                        
                    // Don't duplicate magneto
                    if ( ! magnet.classList.contains('magneto--ready') ) {
                       
                        // create wrapper container
                        let wrapper = document.createElement('div');
                        magnet.classList.add('magneto--ready');
                        wrapper.classList.add('magneto-wrapper');
                        wrapper.style.cssText = "display: inline-block; position: relative";

                        // insert wrapper before magnet in the DOM tree
                        magnet.parentNode.insertBefore(wrapper, magnet);

                        // move magnet into wrapper
                        let w = wrapper.appendChild(magnet);
                        wrapper.addEventListener("mouseover", e => {
                            gsap.to(wrapper, 0.3, { scale: 1.1 });
                            m.active = true;

                        });
                        wrapper.addEventListener("mouseout", e => {
                            let traget = e.target;
                            gsap.to(wrapper, 0.3, { scale: 1 });
                            gsap.to(magnet, theme.magnet.animSpeed, { x: 0, y: 0 });
                            m.active = false;

                        });
                        wrapper.addEventListener("mousemove", e => {
                           m.magnetCursor(e, wrapper, theme.magnet.movmentSpeed);
                           m.callMagneto(e, wrapper, magnet);

                        });
                    }
                }
            },
            mouseMove : function(e) {
                let m = theme.magnet;
                m.mouse.x = e.clientX;
                m.mouse.y = e.clientY;
            },
            callMagneto : function(e, parent, child) {
                theme.magnet.magnetMove(e, parent, child, theme.magnet.targetBorder);
            },
            magnetMove : function(e, parent, target, movement) {
                var boundingRect = parent.getBoundingClientRect();
                var relX = e.clientX - boundingRect.left;
                var relY = e.clientY - boundingRect.top;
                gsap.to(target, theme.magnet.animSpeed, {
                    x: (relX - boundingRect.width / 2) / boundingRect.width * movement,
                    y: (relY - boundingRect.height / 2) / boundingRect.height * movement,
                    ease: Power2.easeOut
                });
            },
            magnetCursor : function(e, parent, movement) {
                let m = theme.magnet;
                var rect = parent.getBoundingClientRect();
                var relX = e.pageX - rect.left;
                var relY = e.pageY - rect.top;
                m.pos.x = rect.left + rect.width / 2 + (relX - rect.width / 2) / movement;
                m.pos.y = rect.top + rect.height / 2 + (relY - rect.height / 2) / movement;
                gsap.to(m.ball, theme.magnet.animSpeed, { x: m.pos.x, y: m.pos.y });
            },
            update :  function(sel) {
                if ( ! theme.globals.isTouch || ! theme.globals.isMobile  ) {
                    // Light mode
                    if ( theme.globals.lightMode ) {
                        return;
                    }
                    if ( document.body.classList.contains("is-cursor-effects") ) {
                        theme.magnet.create(sel);
                    }
                }

            },
        },


        /* ==================================================
          Window Events
        ================================================== */
        events: {

            resize : null,
            waypoints : {},
            parallaxImages : {},
            parallaxScrollEl : {},
            fullScreenWrap : null,

            // Methods
            init: function() {

                // obj path
                let ev = theme.events;

                // Admin Bar fixed
                let WPBar = document.querySelector('#wpadminbar');
                if ( WPBar ) {
                    WPBar.style.position = 'fixed';
                }
                

                // Set global resize event
                ev.resize = window.document.createEvent('UIEvents'); 
                ev.resize.initUIEvent('resize', true, false, window, 0); 

                /* Scroll / Resize Events */
                if ( document.body.classList.contains("is-smoothscroll") === false ) {
                    window.addEventListener('scroll', ev.scrollListener);
                }

                window.addEventListener('resize', ev.resizeListener);

            },

            scrollActions : function(pos) {
                let y = pos.y;
                let x = pos.x;
                let header = document.querySelector('#header');

                if ( y > 0 ) {
                    header.classList.add('header--scrolled');
                } else {
                    header.classList.remove('header--scrolled');
                } 

                // Parallax
                theme.events.doParallax(y);

                // Parallax
                theme.events.doParallaxScroll(y);

                // Fade
                theme.events.doFade(y);
                
                // Waypoints
                if ( theme.events.waypoints[0] ) {
                    let waypoints = theme.events.waypoints;
                    let winHeight = window.innerHeight;
                    let winWidth = window.innerWidth;
                    let delay = 0.1;
                    let delayStep = 0.2;
                    let target = null;

                    for (let i in waypoints ) {
                        let top = y + winHeight;
                        let left = x + winWidth;
                        
                        if ( top >= waypoints[i].posY && left >= waypoints[i].posX ) {
                            

                            // Avoid animation restart
                            if ( waypoints[i].el.classList.contains('done') === false ) {

                                delay = delay+delayStep;
                                
                                if ( waypoints[i].el.classList.contains('.waypoint-delay') ) {
                                    target = waypoints[i].el;
                                    target.style.transitionDelay = delay+"s";
                                }
                                else if ( waypoints[i].el.querySelector('.waypoint-delay') ) {
                                    target = waypoints[i].el.querySelector('.waypoint-delay');
                                    target.style.transitionDelay = delay+"s";
                                } 


                                waypoints[i].el.classList.add('done');

                                // If Target is stagger animation container
                                if ( waypoints[i].el.classList.contains('anim-stagger')) {
                                    let s = waypoints[i].el;
                                    let staggerEls = s.querySelectorAll('.stagger-item');
                                    let tl = gsap.timeline({repeat: 0, repeatDelay: 0, delay:0});
                                    let staggerObj = {duration: 0.3, opacity:1, y:0, ease: 'power3.out'};
                                    let speed = 0.5;
                                    if ( s.getAttribute('data-stagger') ) { 
                                        var parsedObj = JSON.parse(s.getAttribute('data-stagger'));
                                        if ( parsedObj ) {
                                            staggerObj = parsedObj;
                                            speed = parsedObj.duration;
                                        }
                                    }
                                    tl.staggerTo(staggerEls, speed, staggerObj, 0.1 );
                                }

                            }
                        }
                    }

                }
                
            },

            // Scroll Listener 
            scrollListener: function() {    
                let x = window.pageXOffset || document.documentElement.scrollLeft;
                let y = window.pageYOffset || document.documentElement.scrollTop;
                let obj = {
                    x : x,
                    y : y
                }
                theme.events.scrollActions(obj);
            },

            // Fullscreen Scroll Listener 
            FSscrollListener: function() {
                let y = theme.events.fullScreenWrap.scrollTop;
                let x = theme.events.fullScreenWrap.scrollLeft;
                let obj = {
                    x : x,
                    y : y
                }
                theme.events.scrollActions(obj);
            },
            
            // Resize Listener
            resizeListener: function() {
               
            },

            // Waypoints
            getWaypoints: function() {
                let ev = theme.events;
                let w = document.querySelectorAll( '.is-anim .is-waypoint:not(.done)' );

                if ( w.length > 0 ) {
                    for (let i = 0; i < w.length; i++) {
                        let rect = w[i].getBoundingClientRect();
                         ev.waypoints[i] = {
                            posX: rect.left,
                            posY: rect.top,
                            el : w[i]
                         }
                    }
                } else {
                    ev.waypoints = {};
                }
            },
            
            // Fade
            doFade: function(y) {
                
                let fade = document.querySelector('.is-visible .fx-scroll-fade .fade-layer');
                
                if ( fade ) {
                    let fadeHeight = fade.offsetHeight;
                    fade.style.opacity =  y / fadeHeight;
                }


            },

            // Parallax
            doParallax: function(y) {
                let images = theme.events.parallaxImages;
                if ( images[0] ) {
                    for(var i in images) {

                        let scrolledHeight= window.pageYOffset;
                        
                        let elOffset = images[i].el.offsetTop;
                        let elHeight = images[i].el.offsetHeight;

                        if((elOffset > y + scrolledHeight) || (elOffset + elHeight < y)) { continue; }
                        gsap.to( images[i].el, 0.5, { backgroundPosition:'50% '+Math.round((elOffset - y)*3/50)+'px', ease:Power2.easeOut } );
                    }   
                }
            },
            getParallax: function(){
                let ev = theme.events;
                let pImgs = document.querySelectorAll( '.fx-parallax' );
                if ( pImgs.length > 0 ) {
                    for (let i = 0; i < pImgs.length; i++) {
                        ev.parallaxImages[i] = {
                            el : pImgs[i]
                        }
                    }
                } else {
                    ev.parallaxImages = {};
                }

            },

            // Parallax Scroll
            doParallaxScroll: function(y) {
                // Light mode
                if ( theme.globals.lightMode ) {
                    return;
                }
                let scrollEl = theme.events.parallaxScrollEl;
                if ( scrollEl[0] ) {
                    for(var i in scrollEl) {
                        let scrolledHeight= window.pageYOffset;
                        let elOffset = scrollEl[i].el.offsetTop;
                        let elHeight = scrollEl[i].el.offsetHeight;
                        if((elOffset > y + scrolledHeight) || (elOffset + elHeight < y)) { continue; }
                        gsap.to( scrollEl[i].el, 0.5, { y: Math.round((elOffset - y)*3/(scrollEl[i].factor))+'px', scale: 1, ease:Power2.easeOut } );
                    }   
                }
            },
            getParallaxScroll: function(){
                let ev = theme.events;
                let scrollEl = document.querySelectorAll( '.is-parallax-scroll .fx-parallax-scroll' );
                if ( scrollEl.length > 0 ) {
                    for (let i = 0; i < scrollEl.length; i++) {
                        let factor = scrollEl[i].getAttribute('data-factor');
                        ev.parallaxScrollEl[i] = {
                            el : scrollEl[i],
                            factor : factor
                        }
                    }
                } else {
                    ev.parallaxScrollEl = {};
                }

            },

            // Update events
            update: function() {
                let ev = theme.events;
                
                ev.getParallax();
                ev.getParallaxScroll();
                ev.getWaypoints();

                if ( document.querySelector('#fs-scroll') ) {
                    ev.fullScreenWrap = document.querySelector('#fs-scroll');
                    ev.fullScreenWrap.addEventListener('scroll', ev.FSscrollListener);
                }
                
                // Run scroll function with initial parameteres
                ev.scrollActions({x:0,y:0});

            },

        },


        /* ==================================================
          SmoothScroll 
        ================================================== */

        smoothScroll: {

            scrollbar : null,
            scrollbarFullScreen : null,
            init : function() {
                if (document.body.classList.contains("is-smoothscroll")) {
                    theme.smoothScroll.main();
                }
                theme.smoothScroll.fullscreen();
            },
            listener : function(status){
                // Trigger resize event
                window.dispatchEvent(theme.events.resize);

                // Trigger scroll actions
                let obj = {
                    x : status.offset.x,
                    y : status.offset.y
                }
                theme.events.scrollActions(obj);
            },
            main : function() {
                if ( document.querySelector('#app') ) {
                    let app = document.querySelector('#app');
                    let scrollbar = window.Scrollbar;

                    let options = {
                        damping:0.05,
                        renderByPixel: true,
                        continuousScrolling: true,
                    };

                    theme.smoothScroll.scrollbar = Scrollbar.init(app, options);
                    theme.smoothScroll.scrollbar.addListener(theme.smoothScroll.listener);
                }


            },

            fullscreen : function() {

                if ( document.querySelector('#fs-scroll') ) {

                    let scrollbarFs = null;
                    let options = {
                        damping:0.1,
                        renderByPixel: true,
                        continuousScrolling: true,
                        plugins: {
                            overscroll: {
                                effect: 'bounce',
                                damping: 0.1,
                                maxOverscroll: 60
                            },
                        },
                    };

                    let fs = document.querySelector('#fs-scroll');
                    scrollbarFs = window.Scrollbar;

                     if ( document.querySelector('.fs-scroll--h') ) {
                        InvertDeltaPlugin.pluginName = 'invertDelta';
                        InvertDeltaPlugin.defaultOptions = {
                            events: []
                        }
                        scrollbarFs.use(InvertDeltaPlugin);
                        options.plugins['invertDelta'] = {
                            events: [/wheel/]
                        }
                    } 

                    theme.smoothScroll.scrollbarFullScreen = Scrollbar.init(fs, options);
                    theme.smoothScroll.scrollbarFullScreen.addListener(theme.smoothScroll.listener);
                }

            },

            update : function() {
                theme.smoothScroll.fullscreen();

            }
        },


        /* ==================================================
          Small Helpers 
        ================================================== */
        helpers : {

            sidebar : function() {
                let sidebar = document.querySelector('#sidebar');
                if ( sidebar ) {

                    let toggle = (e) => {
                        e.preventDefault();
                        let body = document.body;
                        body.classList.toggle('is-sidebar-open');
                    }
                    
                    document.body.appendChild(sidebar);
                    setTimeout(()=>{ document.body.classList.add('is-sidebar-ready') }, 100);
                    
                    let sidebar_trigger = document.querySelector('#sidebar__trigger');
                    let close_layer = document.querySelector('.sidebar__layer');
                    sidebar_trigger.addEventListener('click', toggle );
                    close_layer.addEventListener('click', toggle );
                    theme.cursor.update('.sidebar__layer');
                    
                }
            },

            scrollTop : function() {

                if ( document.querySelector('.scroll-top') ) {
                    let topButton = document.querySelector('.scroll-top');
                    topButton.addEventListener('click', e => {
                       theme.helpers.scrollToPos(0,0.5,0);

                    });
                }

            },

            scrollToPos : function(pos, duration = 0.5, delay = 0) {
                
                setTimeout( ()=> {

                    if ( isNaN( pos ) === false ) {
                        if ( theme.smoothScroll.scrollbar ) {
                            duration = duration*1000;
                            let s = theme.smoothScroll.scrollbar;
                            s.scrollTo(0, pos, duration);
                        } else {

                            gsap.to(window, {duration: duration, scrollTo: {y: pos, autoKill:false}, ease: "power2"});
                        }
                    }

                }, delay )
                
            },

        },


        /* ==================================================
          Vendors Plugins
        ================================================== */
        plugins: {

            // Lazy Load
            lazy: function() {

                if ( document.body.classList.contains('is-lazyload') ) {

                    var lazyLoadInstance = new LazyLoad({
                        elements_selector: ".lazy",
                        scrollDirection: 'vertical',
                        visibleOnly: true,
                        threshold: 0,
                        callback_reveal: (el) => {
                            el.classList.add('loaded');
                        }
                    });
                }
            },

            // Disqus
            disqus: function() {
                let disqus = document.querySelector('#disqus_thread');
                if (disqus) {

                    let disqusIdentifier = document.querySelector('#disqus_thread').getAttribute('data-post_id')
                      , disqusShortname = document.querySelector('#disqus_thread').getAttribute('data-disqus_shortname')
                      , disqusTitle = document.querySelector('#disqus_title').textContent
                      , disqusUrl = window.location.href
                      , protocol = location.protocol;
                    /* * * Disqus Reset Function * * */
                    if (typeof DISQUS !== 'undefined') {
                        DISQUS.reset({
                            reload: true,
                            config: function() {
                                this.page.identifier = disqusIdentifier;
                                this.page.url = disqusUrl;
                                this.page.title = disqusTitle;
                            }
                        });
                    } else {
                        let dsq = document.createElement('script');
                        dsq.type = 'text/javascript';
                        dsq.async = true;
                        dsq.src = protocol + '//' + disqusShortname + '.disqus.com/embed.js';
                        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
                    }
                }
            }

        },


        /* ==================================================
          Prototypes 
        ================================================== */
        prototypes : function() {

        }

    }

}());