/**
 * arbor day  of game
 * hetao 2016-03-01
 *
 */

define(['jquery'],function(){
    'use strict';

    //配置
    var config                      = {};
        //插入多少行
        config.elemNum                  = 50;
        //从第几行游戏开始
        config.startCell                = 1;
        //非选中洞的状态
        config.holeStatus               = ['flower','grass','blank'];
        //提醒步数
        config.helpCount                = 3;
        //倒计时
        config.countDownTimes           = 20;
        //获得奖励分数
        config.winScore                 = 20;

    //元素
    var $elem                       = {};
        $elem.btnPlayMusicBg        = $('[data-btn="play-music-bg"]');
        $elem.palyerMusicBg         = document.getElementById('player-music-bg');
        $elem.btnPlayMusicSelect    = $('.btn-play-music-Select');
        $elem.palyerMusicSelect     = document.getElementById('player-music-select');
        $elem.containerTrackTable   = $('#container-track-table');
        $elem.scrollContainer       = $('#container-scroll');
        $elem.score                 = $('[data-count="score"]');
        $elem.countDown             = $('[data-count="countDown"]');
        $elem.startPlayGame         = $('[data-btn="startPlayGame"]');


    var s,moveTimer,moveDistance,moveStep= 1,moveCount;
    //事件对象
    var $event                      = {};
    $event = {
        creatElem: function(i){
            var _html = '';
            //每行四个坑位
            var _html_items  =  [];
            //每行中正确的坑位

            var rightCell = $event.randomNum(4);
            //第几行开始游戏
            if(i>=config.startCell){
                _html_items[rightCell] = '<td width="25%" data-cell="right" class="right"></td>';
            }else{
                _html_items[rightCell] = '<td width="25%" data-cell="'+config.holeStatus[2]+'" class="'+config.holeStatus[$event.randomNum(3)]+'"></td>';
            }
            //随机显示其他三个坑位结果
            for(var j=0; j<4;j++) {
                if (j !== rightCell) {
                    var status = config.holeStatus[$event.randomNum(3)]
                    _html_items[j] = '<td width="25%" data-cell="'+status+'" class="'+status+'"></td>';
                }
            }
            //
            _html = '<tr data-items="'+i+'">'+ _html_items[0]+_html_items[1]+_html_items[2]+_html_items[3] + '</tr>';
            return _html;
        },
        //随机获取n以内所有整数
        randomNum:function(n){
            return Math.floor(Math.random()*n);
        },
        //插入花花草草
        insertElem: function(e){
            var i;
            for(var i=0;i<config.elemNum;i++){
                $elem.containerTrackTable.prepend($event.creatElem(i));
            }
            //播放背景音乐
            $event.playMusicBg();
            //第一行添加提示
            $event.selectHelp();
            //设置倒计时起始值
            $elem.countDown.html(config.countDownTimes.toFixed(2));
            //单元格DOM集合
            var trackCell               = $elem.containerTrackTable.find('td');
            //单元格自适应的宽度
            var trackCellWidth          = trackCell.width();
            //当前窗口高度
            var docHeight               = $('body').height();
            //将表格每个单元格设置为正方形
            trackCell.css({'height': trackCellWidth +'px'});
            //载入表格初始位置
            var loadTablePosition = trackCellWidth*config.elemNum-docHeight;

            //将整个表格置于底部
            $elem.scrollContainer.css({'top':-loadTablePosition+'px'});


            //统计计数
            var count = 0;

            //单元格添加事件监听
            trackCell.on('click',function(){
                var $this       = $(this);

                //当前元素索引顺序
                var itemsIndex  = $this.parent('tr').attr('data-items');
                if(itemsIndex==1){
                    //开始倒计时
                    $event.countDown();
                }
                //TODO 选择错误
                //如果有提示 错误无效
                var trackCell   = $elem.containerTrackTable.find('td');
                //console.log(trackCell);
                if( trackCell.hasClass('fill-help')){
                    console.log('你是无敌状态');
                }else{
                    console.log('你是选错了');
                    //TODO selectError
                    if($this.attr('data-cell')!=='right'){
                        $event.selectError($this);
                    }
                }

                //当前不是游戏开始行
                if(itemsIndex<parseInt(config.startCell)){
                    return;
                }else{
                    //TODO selectSuccess
                    if($(this).attr('data-cell')==='right'){
                        //TODO 选择正确
                        //console.log((config.startCell+count)===parseInt(itemsIndex));
                        if(!$(this).hasClass('fill-right')&&(config.startCell+count)===parseInt(itemsIndex)){
                            //播放选中音乐
                            $event.playMusciSelect();
                            //选对操作
                            $event.selectEventSucces($this,$elem.scrollContainer,loadTablePosition,trackCellWidth,itemsIndex);
                            //选对计数+1
                            count++;
                            //显示得分
                            //$elem.score.html(count);
                            $event.countScore(count);
                            //添加提示
                            $event.selectHelp($this,count);
                        }
                    }
                }
            });

            //游戏重新开始按钮添加事件
            $elem.startPlayGame.on('click',function(){
                $event.dialogHide($(this));
                $event.startPlayGame();
                $elem.scrollContainer.css({'top':-loadTablePosition+'px'});
                $event.selectHelp();
                count=0;
                //$elem.score.html(count);
                $event.countScore(count);
                trackCell.removeClass('fill-right fill-error');
            });
        },
        //选择错误
        selectError:function($this){
            $this.siblings('td.right').addClass('fill-error');
            $event.stopPlayGame();
            //TODO 停止计时 stopCountDown
            $event.countDown('stop');
            //console.log($event.countDown().countDownStop());

            return;
        },
        //选择正确
        /**
         * @param $this     当前事件触发对象
         * @param e         移动容器
         * @param initVal   初始容器位置偏移量
         * @param step      每次移动的单位
         * @param n         移动步长
         * @param count     选对计数
         * */
        selectEventSucces:function($this,e,initVal,step,n){
            //TODO 添加正确状态标识
            $this.addClass('fill-right');
            //TODO 向下移动一行

            $event.moveCell(e,initVal,step,n);
        },
        selectHelp:function($this,count){
            //移除当前提示
            $elem.containerTrackTable.find('td').removeClass('fill-help');
            if(config.helpCount>count&&$this!==undefined&&count!==undefined ){
                //给下一行添加提示
                $this.parents('tr').prev('tr').find('td[data-cell="right"]').addClass('fill-help');
            }else if($this===undefined&&count===undefined){
                $('tr[data-items="'+config.startCell+'"]').find('td[data-cell="right"]').addClass('fill-help');
            }
        },
        //播放背景音乐
        playMusicBg:function(){
            $elem.btnPlayMusicBg.on('click',function(){
                if($elem.palyerMusicBg.paused){
                    $elem.palyerMusicBg.play();
                    //this.innerHTML = '播放';
                    $(this).removeClass('ar-music-pause');
                    return ;
                }else{
                    $elem.palyerMusicBg.pause();
                    $(this).addClass('ar-music-pause');
                    return;
                }
            });
        },
        //播放选中音乐
        playMusciSelect:function(){
            if(!$elem.palyerMusicBg.paused){
                $elem.palyerMusicSelect.play();
            }

        },
        //逐行移动
        moveCell:function(e,initVal,step,n){
            //需要移动的真实步长
            var startMoveNum = n-config.startCell+1;
            //e.css({'top':-initVal+step*startMoveNum+'px'});

            if(moveTimer&&moveStep>1){
                clearInterval(moveTimer);
            }

            var startPos        = -initVal;
                moveDistance    = step*startMoveNum;
                moveCount       = step*startMoveNum;

            moveTimer = self.setInterval(function(){
                if(moveStep>moveCount){
                    clearInterval(moveTimer);
                }else{
                    var linerVal = $event.tween.Linear(moveStep,startPos,moveDistance,moveCount);
                    e.css({'top':linerVal+'px'});
                    moveStep+=2;
                }
            },10);
        },
        //倒计时
        countDown:function(stop){
            //如果停止计时，清除计时器
            if(stop==='stop'){
                clearInterval(s);
            }else{
                //开始计时
                $event.countDownEvent();
            }
        },
        //
        countDownEvent:function(){
            var remainTime = config.countDownTimes;
            s = setInterval(function(){
                remainTime= remainTime-0.01;
                if(remainTime<=0.01){
                    remainTime = 0.00;
                    clearInterval(s);
                    $event.stopPlayGame();
                }
                $elem.countDown.html(remainTime.toFixed(2));
            },10);
        },
        stopPlayGame:function(){
             $('.fill-cover').css({'display':'block'});
            var timerDialog = self.setTimeout(function(){
                $event.dialogStatus();
            },2000);
        },
        startPlayGame:function(){
             $('.fill-cover').css({'display':'none'});
            //设置倒计时起始值
            $elem.countDown.html(config.countDownTimes.toFixed(2));

            //重置移动计时器
            moveStep =1;
        },
        //信息对话框
        dialogStatus:function(e){
            var score           = parseInt($elem.score.text());
            var scoreBast       = parseInt($elem.score.attr('data-count-bast'));
            var dataScoreSuc    = $('[data-score="success"]');
            var dataScoreFail   = $('[data-score="fail"]');
            var dataBsetScore   = $('[data-bast="score"]');
            if(e===''||e===undefined){
                if(score>=config.winScore){
                    $('[data-dialog="dekaronSuccess"]').css({'display':'block'});
                    dataScoreSuc.html(score);
                }else{
                    $('[data-dialog="dekaronFail"]').css({'display':'block'});
                    dataScoreFail.html(score);
                }
            }else{
                if(e==='success'){
                    $('[data-dialog="dekaronSuccess"]').css({'display':'block'});
                    dataScoreSuc.html(score);
                }else if(e==='fail'){
                    $('[data-dialog="dekaronFail"]').css({'display':'block'});
                    dataScoreFail.html(score);
                }
            }

            //显示最佳成绩
            if(score>=scoreBast){
                dataBsetScore.html(score);
            }
        },
        //收起对话框
        dialogHide:function($this){
            $('[data-dialog="'+$this.attr('data-hide-name')+'"]').css({'display':'none'});
        },
        //打开对话框
        dialogShow:function($this){
            $('[data-dialog="'+$this.attr('data-show-name')+'"]').css({'display':'block'});
        },
        //统计得分
        countScore:function(count){
            $elem.score.html(count);
            var countBast = parseInt($elem.score.attr('data-count-bast'));
            if(count>countBast){
                $elem.score.attr({'data-count-bast':count});
            }
        },
        //动画
        /*
         Linear：无缓动效果(匀速运动)；
         Quadratic：二次方的缓动；
         Cubic：三次方的缓动
         Quartic：四次方的缓动；
         Quintic：五次方的缓动；
         Sinusoidal：正弦曲线的缓动；
         Exponential：指数曲线的缓动；
         Circular：圆形曲线的缓动；
         Elastic：指数衰减的正弦曲线缓动；
         Back：超过范围的三次方缓动）；
         Bounce：指数衰减的反弹缓动。


         每个效果都分三个缓动方式（方法），分别是：
         easeIn：从0开始加速的运动；
         easeOut：减速到0的运动；
         easeInOut：前半段从0开始加速，后半段减速到0的运动。



         函数的四个参数分别代表：
         t--- current time（当前时间）；
         b--- beginning value（初始值）；
         c--- change in value（变化量）；
         d---duration（持续时间）

         运算的结果就是当前的运动路程。

         整理翻译:Code宝宝
         翻译或解释不对的地方希望各位修正、批评。
         */

        tween : {
            Linear: function (t, b, c, d) {
                return c * t / d + b;
            }
        }
    };

    //
    return {
        'insertElem':$event.insertElem,
        'config':config
    };
});
