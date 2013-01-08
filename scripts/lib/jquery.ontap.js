(function(){
    // Taken from 15-237 website. Modified slightly.
    // onClick with mobile support
    // call `downCB` when button should be down
    // call `upCB` when button should not be down
    // call `tapCB` when the button is tapped
    $.fn.ontap = function(downCB, upCB, tapCB){
        if (!upCB) upCB = function() {};
        if (!downCB) downCB = function() {};
        // bind the callbacks to the jQuery object (standard jQuery behavior)
        downCB = downCB.bind(this);
        upCB = upCB.bind(this);
        if (tapCB) tapCB = tapCB.bind(this);

        var startx;
        var starty;
        
        var potentialTap;

        var down = function(x, y){
            startx = x;
            starty = y;
            potentialTap = true;
            downCB();
        };

        // cancel if the touch moves more than 10px (because it could be a potential scroll)
        var move = function(x, y){
            if (potentialTap &&
                (window.Math.abs(x - startx) > 10 || 
                window.Math.abs(y - starty) > 10)){
                potentialTap = false;
                upCB();
            }
        };

        var exit = function(){
            if (potentialTap){
                potentialTap = false;
                upCB();
            }
        };

        var up = function(event){
            if (potentialTap){
                upCB();
                if (tapCB) tapCB(event);
                potentialTap = false;
            }
        };

        // Detects if the browser supports touch events
        if ('ontouchstart' in document.documentElement){

            this.on('touchstart', function(event){
                var x = event.originalEvent.touches[0].clientX;
                var y = event.originalEvent.touches[0].clientY;
                down(x, y);
            });
            this.on('touchend', function(event){
                up(event);
            });
            // cancel on touchleave (finger moves out of object)
            this.on('touchleave', function(event){
                exit();
            });
            this.on('touchmove', function(event){
                var x = event.originalEvent.touches[0].clientX;
                var y = event.originalEvent.touches[0].clientY;
                move(x, y);
            });
        }
        // fallback to clicks
        else {
            this.on('mousedown', function(event){
                down(event.clientX, event.clientY);
            });
            this.on('mouseout', function(event){
                exit();
            });
            this.on('mouseup', function(event){
                up();
            });
        }
    };
})();