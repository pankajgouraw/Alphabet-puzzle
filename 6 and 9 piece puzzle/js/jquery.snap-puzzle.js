/*
	jQuery snapPuzzle v1.0.0
    Copyright (c) 2014 Hans Braxmeier / Simon Steinberger / Pixabay
    GitHub: https://github.com/Pixabay/jQuery-snapPuzzle
	License: http://www.opensource.org/licenses/mit-license.php


*/





(function($){


    $.fn.snapPuzzle = function(options){
        var o = $.extend({ pile: '', containment: 'document', rows: 5, columns: 5, onComplete: function(){} }, options);

        // public methods
        if (typeof options == 'string') {
            this.each(function(){
                var that = $(this),
                    o = that.data('options'),
                    pieceWidth = that.width() / o.columns,
                    pieceHeight = that.height() / o.rows,
                    pile = $(o.pile),
                    maxX = pile.width() - pieceWidth,
                    maxY = pile.height() - pieceHeight,
                    puzzle_offset = that.closest('span').offset(),
                    pile_offset = pile.offset();

                if (options == 'destroy') {
                    $('.'+o.puzzle_class).remove();
                    that.unwrap().removeData('options');
                    pile.removeClass('snappuzzle-pile');
                } else if (options == 'refresh') {
                    $('.snappuzzle-slot.'+o.puzzle_class).each(function(){
                        var x_y = $(this).data('pos').split('_'), x = x_y[0], y = x_y[1];
                        $(this).css({
                            width: pieceWidth,
                            height: pieceHeight,
                            left: y*pieceWidth,
                            top: x*pieceHeight
                        });
                    });
                    $('.snappuzzle-piece.'+o.puzzle_class).each(function(){
                        if ($(this).data('slot')) {
                            // placed on slot
                            var x_y = $(this).data('slot').split('_'), slot_x = x_y[0], slot_y = x_y[1],
                                x_y = $(this).data('pos').split('_'), pos_x = x_y[0], pos_y = x_y[1];;
                            $(this).css({
                                width: pieceWidth,
                                height: pieceHeight,
                                left: slot_y*pieceWidth+puzzle_offset.left-pile_offset.left,
                                top: slot_x*pieceHeight+puzzle_offset.top-pile_offset.top,
                                backgroundPosition: (-pos_y*pieceWidth)+'px '+(-pos_x*pieceHeight)+'px',
                                backgroundSize: that.width()
                            });
                        } else {
                            // placed anywhere else
                            var x_y = $(this).data('pos').split('_'), x = x_y[0], y = x_y[1];
                            $(this).css({
                                width: pieceWidth,
                                height: pieceHeight,
                                left: Math.floor((Math.random()*(maxX+1))),
                                top: Math.floor((Math.random()*(maxY+1))),
                                backgroundPosition: (-y*pieceWidth)+'px '+(-x*pieceHeight)+'px',
                                backgroundSize: that.width()
                            });
                        }
                    });
                }
            });
            return this;
        }

        function init(that){
            var puzzle_class = 'sp_'+new Date().getTime(),
                puzzle = that.wrap('<span class="snappuzzle-wrap"/>').closest('span'),
                src = that.attr('src'),
                pieceWidth = that.width() / o.columns,
                pieceHeight = that.height() / o.rows,
                pile = $(o.pile).addClass('snappuzzle-pile').css({'height':that.height()}),
                maxX = pile.width() - pieceWidth,
                maxY = pile.height() - pieceHeight;

            o.puzzle_class = puzzle_class;
            that.data('options', o);

            for (var x=0; x<o.rows; x++) {
                for (var y=0; y<o.columns; y++) {
                    $('<div class="snappuzzle-piece '+puzzle_class+'"/>').data('pos', x+'_'+y).css({
                        width: pieceWidth,
                        height: pieceHeight,
                        position: 'absolute',
                        left: Math.floor((Math.random()*(maxX+1))),
                        top: Math.floor((Math.random()*(maxY+1))),
                        zIndex: Math.floor((Math.random()*10)+1),
                        backgroundImage: 'url('+src+')',
                        backgroundPosition: (-y*pieceWidth)+'px '+(-x*pieceHeight)+'px',
                        backgroundSize: that.width()
                    }).draggable({
                        start: function(e, ui){ $(this).removeData('slot');
                         }, 
                         revert:  function(dropped) {
                                                 var $draggable = $(this),
                                                     hasBeenDroppedBefore = $draggable.data('hasBeenDropped'),
                                                     wasJustDropped = dropped && dropped[0].id == "droppable";
                                                 if(wasJustDropped) {
                                                     // don't revert, it's in the droppable
                                                     return false;
                                                 } else {
                                                     if (hasBeenDroppedBefore) {
                                                         // don't rely on the built in revert, do it yourself
                                                         $draggable.animate({ top: 0, left: 0 }, 'slow');

                                                         return false;
                                                     } else {
                                                         // just let the built in revert work, although really, you could animate to 0,0 here as well
                                                         return true;
                                                     }
                                                 }
                                            },
                        stack: '.snappuzzle-piece',
                        containment: o.containment
                    }).appendTo(pile).data('lastSlot', pile);

                    $('<div class="snappuzzle-slot '+puzzle_class+'"/>').data('pos', x+'_'+y).css({
                        width: pieceWidth,
                        height: pieceHeight,
                        left: y*pieceWidth,
                        top: x*pieceHeight
                    }).appendTo(puzzle).droppable({
                           activeClass: 'ui-state-hover',
                            hoverClass: 'ui-state-active',
                            drop: function(event, ui) {
                                $(this).addClass('ui-state-highlight').find('p').html('Dropped!');
                                $(ui.draggable).data('hasBeenDropped', true);
                            },

                        accept: '.'+puzzle_class,
                        hoverClass: 'snappuzzle-slot-hover',
                        drop: function(e, ui){
                          
                            var slot_pos = $(this).data('pos');

                            // prevent dropping multiple pieces on one slot
                            $('.snappuzzle-piece.'+puzzle_class).each(function(){
                                if ($(this).data('slot') == slot_pos) slot_pos = false;
                            });
                            if (!slot_pos) return false;

                            ui.draggable.data('lastSlot', $(this)).data('slot', slot_pos);
                            ui.draggable.position({ of: $(this), my: 'left top', at: 'left top' });
                            if (ui.draggable.data('pos')==slot_pos) {
                                // console.log("right position");
                                ui.draggable.addClass('correct');
                                // fix piece
                                // $(this).droppable('disable').fadeIn().fadeOut();
                                $(this).droppable('disable').css('opacity', 1).fadeOut(1000);
                                ui.draggable.css({opacity: 0, cursor: 'default','z-index':0}).draggable('disable');
                                $('.disabled').css({'z-index':0}); 
                                if ($('.snappuzzle-piece.correct.'+puzzle_class).length == o.rows*o.columns) o.onComplete(that);
                            }else{
                                // console.log("wrong position");
                            }
                        }
                    });
                }
            }
        }

        return this.each(function(){
            if (this.complete) init($(this));
            else $(this).load(function(){ init($(this)); });
        });
    };





}(jQuery));
