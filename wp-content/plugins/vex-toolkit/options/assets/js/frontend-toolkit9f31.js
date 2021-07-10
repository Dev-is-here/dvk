/**
 * Frontend Toolkit JS
 *
 * @author Rascals Themes
 * @category JavaScripts
 * @package Vex Toolkit
 * @version 1.0.0
 */


var themeToolkit = (function() {

    "use strict";

    // Document
    const doc = document;

    /* Run scripts
     -------------------------------- */

    /* Ajax: Enabled */
    doc.addEventListener('AXStartJS', function(customEvent) {
         themeToolkit.reload();
    });

    doc.addEventListener("DOMContentLoaded", function() {
        themeToolkit.init();
    });


    return {

        loaded : false,

        /* Init
         -------------------------------- */
        init : function(){
            this.lightbox.init();
            this.events.list();
            this.player.init();
            this.disqus();
        },
        reload: function() {
            this.lightbox.init();
            this.events.list();
            this.player.update();
            this.disqus();
        },
        

        /* ==================================================
            BasicLightbox
        ================================================== */
        lightbox : {

            init : function() {
                let lb = themeToolkit.lightbox;
                if ( document.querySelector('.fx-lightbox') ) {
                    const boxes = document.querySelectorAll('.fx-lightbox');
                    for ( let box of boxes ) {
                        box.addEventListener( 'click', e => {
                            let lbId = box.getAttribute('data-lb-id');
                            if ( lbId === false || lbId === null ) {
                                return;
                            }
                            let content = document.querySelector('#'+lbId);
                            if ( content ) {
                                let bl = basicLightbox.create(
                                    content.innerHTML, {
                                        className: 'fx-cursor fx-cursor-close', 
                                    }
                                );
                                bl.show(() => {
                                    document.querySelector('.basicLightbox .lightbox__inner').addEventListener('click', ()=> bl.close() );
                                    theme.cursor.update('.basicLightbox'); 
                                    if ( document.querySelector('#cursor') ) {
                                        document.querySelector('#cursor').classList.add('close');
                                    }
                                    
                                });
                            }
                        });
                    }
                }
            },

        },


        /* ==================================================
          Events
        ================================================== */
        events : {

            init : function() {
                let event = themeToolkit.events;
                
            },
            list: function() {
                if ( document.querySelector('.events-list .event-list-item') ) {
                    let listEvents = document.querySelectorAll('.events-list .event-list-item');
                    let listContainer = document.querySelector('.events-list');

                    for (let ev of listEvents) {
                         ev.addEventListener("mouseover", e => {
                            listContainer.classList.add('is-hover');
                            ev.classList.add('is-active');
                        });
                        ev.addEventListener("mouseout", e => {
                            listContainer.classList.remove('is-hover');
                            ev.classList.remove('is-active');

                        });
                    }  
                }

            },

        },


        /* ==================================================
          Player 
        ================================================== */
        player : {

            sound : false,
            bgPlayer : null,
            BgPlayerPlaying: false,
            isBgPlayer: false,
            bgSrcInit : null,
            volInterval : null,
            volume :  0.8,
            smoothTrans: true,
            progressBar: null,
            mousedown: false,
            firstLoad: false,
            moveBar: false,

            init : function(container) {

                let that = themeToolkit.player;
                let bgPlayer = doc.querySelector( '.bg-player.rascals-player' );
               
                if ( bgPlayer ) {
                    let bgPageAudio = doc.querySelector('.rascals-player-audio');
                    that.bgPlayer = bgPlayer; 
                    that.bgSrcInit = bgPlayer.getAttribute('href');
                    if (bgPageAudio) {
                        let src = bgPageAudio.getAttribute('data-audio');
                        that.bgPlayer.setAttribute('href',src);
                    }
                }

                // Set players
                that.setPlayers();
            },
            
            setPlayers : function() {
                let that = themeToolkit.player;
                let players = doc.querySelectorAll( '.rascals-player' );
                for ( let p of players ) {
                    if ( p.hasPlayer && p.hasPlayer === true ) {
                        continue;
                    }
                    p.hasPlayer = true;
                    p.addEventListener('click', e => {
                        that.trigger( e.currentTarget );

                        // Prevent link default
                        e.preventDefault();
                    }, true);
                }
            },
            
            progress : function() {
                let that = themeToolkit.player;
                let target = that.sound.target;
                let length = that.sound.duration
                let currTime = that.sound.currentTime;
                let totalLength = that.calculateTotalValue(length);
                let currentTime = that.calculateCurrentValue(currTime);

                // If player is on the tracklist
                if ( that.sound.tracklist ) {
                    let elapsedEl = that.sound.listItem.querySelector('.audio-ctrl__elapsed');
                    let totalEl = that.sound.listItem.querySelector('.audio-ctrl__total');
                    let positionBar = that.sound.listItem.querySelector('.audio-ctrl__position');
                    // calculate current value time
                    elapsedEl.innerHTML = currentTime;
                    // calculate total length of value
                    totalEl.innerHTML = totalLength;
                    let percent = 100 * currTime / length;
                    percent = percent.toFixed(2);
                    positionBar.style.width = percent + '%';
                    
                    // Next track
                    if ( currTime >= length ) {
                        that.playNext();
                    }
                }

                // Loading
                if ( that.firstLoad === true ) {
                    if ( currTime > 0 ) {
                        that.firstLoad = false;
                        that.clearStatus();
                        that.addClasses('is-player-playing');
                        that.firstLoad === false;
                    }
                }
               
            },

            seek : function(event) {
                let that = themeToolkit.player;
                if ( that.sound.currentTime ) {
                    let positionBar = that.sound.listItem.querySelector('.audio-ctrl__position');
                    let percent = event.offsetX / this.offsetWidth;
                    let jumpTo = percent * that.sound.duration;
                    that.sound.currentTime = jumpTo;
                    let moveTo = 100 * percent;
                    moveTo = moveTo.toFixed(2);
                    positionBar.style.width = moveTo + '%';
                }
            },
            scrub : function(event) {
                let that = themeToolkit.player;
                if ( that.sound.currentTime && that.mousedown) {
                    that.moveBar = true;
                    that.sound.pause();
                    let positionBar = that.sound.listItem.querySelector('.audio-ctrl__position');
                    let percent = event.offsetX / this.offsetWidth;
                    let jumpTo = percent * that.sound.duration;
                    that.sound.currentTime = jumpTo;
                    let moveTo = 100 * percent;
                    moveTo = moveTo.toFixed(2);
                    positionBar.style.width = moveTo + '%';
                }
                if ( that.mousedown === false && that.moveBar === true ) {
                    that.moveBar = false;
                    that.sound.play(); 
                }
            },

            addNewListeners : function() {
                let that = themeToolkit.player;

                // Remove old listeners
                if ( that.progressBar !== null ) {
                    that.progressBar.removeEventListener("click", that.seek);
                    that.progressBar.removeEventListener('mousedown', () => mousedown = true);
                    that.progressBar.removeEventListener('mouseup', () => mousedown = false);
                    that.progressBar.removeEventListener('mousemove', that.scrub);
                }
                
                // Bind progressbar listener
                that.progressBar = that.sound.listItem.querySelector('.audio-ctrl__progress');
                that.progressBar.addEventListener("click", that.seek);
                that.progressBar.addEventListener('mousedown', () => that.mousedown = true);
                that.progressBar.addEventListener('mouseup', () => that.mousedown = false);
                that.progressBar.addEventListener('mousemove', that.scrub );

            },

            trigger : function(target) {
                let that = themeToolkit.player;
                let track_url = target.getAttribute('href');
                let loop = true;
                let currentUrl;
                let init_list = false;
                that.firstLoad = false;
                
                if ( track_url === false || track_url === '#' || track_url === '' ) {
                    return;
                }

                // BG Player
                if ( that.isBgPlayer === true && that.sound) {
                    if ( that.sound.paused ) {
                        that.BgPlayerPlaying = false;
                    } else {
                        that.BgPlayerPlaying = true;
                    }
                }

                // New Track
                if ( that.sound === false ) {
                    that.sound = new Audio(track_url);
                    that.sound.ontimeupdate = that.progress;
                    that.sound.addEventListener('error', that.error );
                    that.sound.target = target;
                    that.firstLoad = true;
                } 

                if ( that.sound.src !== track_url || that.sound.target.isEqualNode(target) === false ) {
                     that.sound.src = track_url;
                     that.firstLoad = true;
                }

                
                if ( that.firstLoad === true ) {

                    // Remove react connection
                    that.sound.reactWIth = null;

                    // React element
                    if (target.getAttribute('data-react-with')) {
                        let reactSelector = target.getAttribute('data-react-with');
                        if ( document.querySelector(reactSelector) ) {
                            that.sound.reactWIth = document.querySelector(reactSelector);
                        }
                    }

                    // Track from the list
                    if ( target.getAttribute('data-list')) {
                        let listId = target.getAttribute('data-list');
                        that.sound.tracklist = document.getElementById( listId );
                        that.sound.listItem = themeToolkit.getClosest(target, '.rascals-player-list__item');
                        that.sound.listLength = that.sound.tracklist.querySelectorAll('.rascals-player-list__item').length;
                        that.sound.index = that.listIndex(that.sound.listItem);
                        that.sound.loop = false;
                        that.addNewListeners();
                    } 

                    // Single
                    if ( target.getAttribute('data-list') === null ) {
                        that.sound.loop = true;
                        that.sound.tracklist = null;
                        that.sound.listItem = null;
                    }

                    // BG Player
                    if ( target.classList.contains('bg-player') ) {
                        that.isBgPlayer = true; 
                    } else {
                        that.isBgPlayer = false; 
                    }

                }


                that.sound.target = target;
                that.togglePlay(that.sound);

               
            },
            
            clearStatus :  function() {

                // Grab ready players
                let playing = doc.querySelectorAll( '.is-player-playing' );
                let paused = doc.querySelectorAll( '.is-player-paused' );
                let loading = doc.querySelectorAll( '.is-player-loading' );

                for ( let p of playing ) {
                    p.classList.remove('is-player-playing');
                }
                for ( let p of paused ) {
                    p.classList.remove('is-player-paused');
                }
                 for ( let p of loading ) {
                    p.classList.remove('is-player-loading');
                }
                
            },

            addClasses : function(cls) {
                let that = themeToolkit.player;

                that.sound.target.classList.add(cls);
                
                if ( that.sound.listItem ) {
                    that.sound.listItem.classList.add(cls);
                }
                // react with
                if (that.sound.reactWIth) {
                    that.sound.reactWIth.classList.add(cls);
                }
            },
            
            togglePlay: function(media) {
                let that = themeToolkit.player;
                let target = media.target;

                that.clearStatus();
                if ( that.firstLoad === true ) {
                    that.addClasses('is-player-loading');
                    setTimeout(()=> { media.play(); }, 150);
                    
                } else {
                     if ( media.paused ) {
                        that.addClasses('is-player-playing');
                        setTimeout(()=> { media.play(); }, 150);
                    } else {
                        that.addClasses('is-player-paused');
                        media.pause();
                    }
                }
               
            },

            playNext : function() {
                 let that = themeToolkit.player;
                 if (that.sound.tracklist) {
                 	let isGoodTrack = that.sound.tracklist.querySelectorAll('.rascals-player-list__item:not(.is-broken-track)');
                 	if ( isGoodTrack.length !== 0 ) {
	                    let listLength = that.sound.listLength;
	                    let thisIndex = that.sound.index;
	                    let nextIndex = thisIndex;
	                    nextIndex++

	                    if ( nextIndex === listLength ) {
	                        nextIndex = 0;
	                    }

	                    let list = that.sound.tracklist.querySelectorAll('.rascals-player-list__item');
	                    let nextEl = list[nextIndex].querySelector('.rascals-player');
	                    if ( nextEl ) {
	                        that.trigger(nextEl);
	                    }
                	}
                 }

            },

            setVolDown : function(callback) {
                let that = themeToolkit.player;
                let v = that.sound.volume;
                that.volInterval = setInterval(function () {
                    // Only fade if past the fade out point or not at zero already
                    if (v > 0.0) {
                        v -= 0.1;
                        if ( v < 0 ) {
                            that.sound.volume = 0;
                        } else {
                            that.sound.volume = v;
                        }
                    }
                    // When volume at zero stop all the intervalling
                    if (that.sound.volume === 0.0) {
                        clearInterval(that.volInterval);
                        callback();
                    }
                }, 200);
            },

            setVolUp : function(callback) {
                let that = themeToolkit.player;
                let v = 0;
                that.volInterval = setInterval(function () {

                    // Only fade if past the fade out point or not at zero already
                    if (v < that.volume) {
                        v += 0.1;
                        if ( v > that.volume ) {
                            that.sound.volume = that.volume;
                        } else {
                            that.sound.volume = v;
                        }
                    }
                    // When volume at zero stop all the intervalling
                    if (that.sound.volume === that.volume) {
                        clearInterval(that.volInterval);
                    }
                }, 200);
            },

            smooth : function(targetSrc) {
                let that = themeToolkit.player;

                // Clear interval
                clearInterval(that.volInterval);

                if ( that.smoothTrans ) {

                    // Down volume
                    that.setVolDown(function(){

                        that.sound.src = targetSrc;
                        that.sound.volume = 0;
                        that.firstLoad = true;
                        that.togglePlay(that.sound, that.bgPlayer);
                        
                        // Up volume on new track
                         that.setVolUp();

                    });

                } else {
                    that.firstLoad = true;
                    that.sound.src = src;
                    that.togglePlay(that.sound, that.bgPlayer);
                }

            },

            // BG Player
            setBgPlayer : function(){
                let that = themeToolkit.player;

                if ( that.bgPlayer === null ) {
                    return;
                }

                let bgPageAudio = doc.querySelector('.rascals-player-audio');
                let srcInit = that.bgSrcInit;
                let src = that.bgPlayer.getAttribute('href');
                
             
                // Set src
                if (bgPageAudio) {
                    src = bgPageAudio.getAttribute('data-audio');
                } else if ( src !== srcInit ) {
                    src = srcInit;
                }
                that.bgPlayer.setAttribute('href',src);

                if ( that.sound ) {
                    that.sound.target = that.bgPlayer;
                    if ( that.sound.paused === false && that.sound.currentSrc !== src ) {
                        
                        that.smooth(src);
                      
                    } else if ( that.sound.paused && that.sound.currentSrc !== src ) {
                         that.sound.src = src;
                         that.sound.volume = that.volume;
                    }

 
                }

            },

            calculateTotalValue : function(length) {
                if ( isNaN(length) ) {
                    length = 0;
                }
                let minutes = Math.floor(length / 60),
                    seconds_int = length - minutes * 60,
                    seconds_str = seconds_int.toString(),
                    seconds = seconds_str.substr(0, 2),
                    time = minutes + ':' + seconds
                return time;
            },

            calculateCurrentValue : function(currentTime) {
                if ( isNaN(currentTime) ) {
                    currentTime = 0;
                }
                let current_hour = parseInt(currentTime / 3600) % 24,
                    current_minute = parseInt(currentTime / 60) % 60,
                    current_seconds_long = currentTime % 60,
                    current_seconds = current_seconds_long.toFixed(),
                    current_time = (current_minute < 10 ? "0" + current_minute : current_minute) + ":" + (current_seconds < 10 ? "0" + current_seconds : current_seconds);

                return current_time;
            },

            listIndex : function(el) {
                var i=0;
                while(el.previousElementSibling ) {
                    el=el.previousElementSibling;
                    i++;
                }
                return i;
            },

            error : function(e) {
                let that = themeToolkit.player;

                switch (e.target.error.code) {
                    case e.target.error.MEDIA_ERR_ABORTED:
                        console.log('You aborted the media playback.'); break;
                    case e.target.error.MEDIA_ERR_NETWORK:
                        console.log('A network error caused the media download to fail.'); break;
                    case e.target.error.MEDIA_ERR_DECODE:
                        console.log('The media playback was aborted due to a corruption problem or because the media used features your browser did not support.'); break;
                    case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        console.log('The media could not be loaded, either because the server or network failed or because the format is not supported.'); break;
                    default:
                        console.log('An unknown media error occurred.');
                }

                that.clearStatus();
                that.addClasses('is-broken-track');
                that.playNext();

            },

            update : function() {
                let that = themeToolkit.player;

                if ( that.sound && that.sound.target ) {
                    
                    // BG Player is paused and tracklist is played                    
                    if ( that.sound.target.classList.contains('bg-player') === false && that.BgPlayerPlaying === false ) {
                        // Down volume
                        that.setVolDown(function(){

                            that.sound = false;
                            that.clearStatus();

                        });
                       
                    } else {
                        // BG Player is played
                        that.setBgPlayer();

                    }
                        
                } 

              
                
                // Set Players
                that.setPlayers();
               
            }
           
        },


        /* ==================================================
          Disqus 
        ================================================== */
        disqus : function() {
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
        },


        /* ==================================================
          Helpers 
        ================================================== */
        getClosest : function (elem, selector) {

            // Element.matches() polyfill
            if (!Element.prototype.matches) {
                Element.prototype.matches =
                    Element.prototype.matchesSelector ||
                    Element.prototype.mozMatchesSelector ||
                    Element.prototype.msMatchesSelector ||
                    Element.prototype.oMatchesSelector ||
                    Element.prototype.webkitMatchesSelector ||
                    function(s) {
                        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                            i = matches.length;
                        while (--i >= 0 && matches.item(i) !== this) {}
                        return i > -1;
                    };
            }

            // Get the closest matching element
            for ( ; elem && elem !== document; elem = elem.parentNode ) {
                if ( elem.matches( selector ) ) return elem;
            }
            return null;

        },

    }

}());