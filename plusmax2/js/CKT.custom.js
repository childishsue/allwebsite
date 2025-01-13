if ($) {

    window.CKT.temp = {};

    window.CKT.extend('helper', {

        //产生页面导航列
        build_page_menus: function (pagination, targetDom) {
            var targetDom = targetDom || null,
                pageDom = targetDom.find('.page'),
                pagination = pagination || null,
                page_size = pagination ? pagination['page_size'] : null,
                page_number = pagination ? pagination['page_number'] : null,
                total_rows = pagination ? pagination['total_rows'] : null,
                max_page_nummer = (total_rows && page_size) ? Math.floor(total_rows / page_size) + 1 : null,
                pageContent = '';

            pageDom.find('li').each(function () {

                $(this).remove();
            });

            if (pagination) {

                pageContent += '<ul>';

                if (page_number > 1) {

                    pageContent += '<li><a href="#" page_number="1">|<</a></li>';
                    pageContent += '<li><a href="#" page_number="' + (page_number - 1) + '"><</a></li>';
                }

                for (var num = 1; num <= max_page_nummer; num++) {

                    pageContent += '<li' + (num == page_number ? ' class="active"' : '') + '><a href="#" page_number="' + num + '">' + num + '</a></li>';
                }

                if (page_number < max_page_nummer) {

                    pageContent += '<li><a href="#" page_number="' + (page_number + 1) + '">></a></li>';
                    pageContent += '<li><a href="#" page_number="' + max_page_nummer + '">>| </a></li>';
                }

                pageContent += '</ul>';

                if (!targetDom.find('input[name="page_number"]').exists()) {

                    targetDom.append('<input type="hidden" name="page_number">')
                }

                targetDom.find('input[name="page_number"]').val(page_number);

                if (!targetDom.find('input[name="page_size"]').exists()) {

                    targetDom.append('<input type="hidden" name="page_size">')
                }

                targetDom.find('input[name="page_size"]').val(page_size);

                pageDom.html(pageContent).promise().done(function () {

                    pageDom.find('li > a').click(function (event) {

                        event.preventDefault();

                        targetDom.find('input[name="page_number"]').val($(this).attr('page_number')).promise().done(function () {

                            targetDom.andSelf().trigger("refresh");
                        });
                    });
                });
            }
        },
        //刷新金流付款详细
        filter_pay_type_change: function (dataObj) {

            var requestFn = function () {

                var cktRequest = CKT.request();

                return typeof cktRequest['get_payment_id'] == 'function' ? cktRequest['get_payment_id'] : function () { };
            }(),
                filterFn = function (detailInfo) {

                    var self = $(this),
                        targetDom = $('[name="pay_type_detail_info"]'),
                        messageDom = targetDom.find('[name="pay_notice_message"]'),
                        selectPayTypeDom = targetDom.find('select[name="pay_type"]'),
                        divBankListDom = targetDom.find('div[name="bank_list"]'),
                        divMarketListDom = targetDom.find('div[name="market_list"]'),
                        divPayBalanceInfoDom = targetDom.find('div[name="pay_balance_info"]'),
                        selectPayTypeVal = selectPayTypeDom.val(),
                        payMinAmount = 1,
                        payMaxAmount = 10000,
                        payMinAmountDom = targetDom.find('span[name="pay_min_amount"]'),
                        payMaxAmountDom = targetDom.find('span[name="pay_max_amount"]'),
                        handleBalanceDom = targetDom.find('input[name="handle_balance"]');

                    if (!empty(detailInfo)) {

                        targetDom.hide();

                        if (in_array(selectPayTypeVal, ['web_bank_pay', 'atm_pay'])) {

                            divBankListDom.show();

                        } else {

                            divBankListDom.hide();
                        }

                        if (in_array(selectPayTypeVal, ['market_pay'])) {

                            divMarketListDom.show();

                        } else {

                            divMarketListDom.hide();
                        }

                        if (in_array(selectPayTypeVal, ['virtual_coin_pay'])) {

                            divPayBalanceInfoDom.hide();

                            divPayBalanceInfoDom.find('input[name="handle_balance"]').removeAttr('required');

                        } else {

                            divPayBalanceInfoDom.show();

                            divPayBalanceInfoDom.find('input[name="handle_balance"]').attr('required', true);
                        }

                        if (!empty(selectPayTypeVal) && typeof detailInfo[selectPayTypeVal] != 'undefined') {

                            payMessage = typeof detailInfo[selectPayTypeVal]['pay_notice_message'] != 'undefined' ? detailInfo[selectPayTypeVal]['pay_notice_message'] : '';

                            messageDom.html(payMessage);

                            payMinAmount = detailInfo[selectPayTypeVal]['pay_min_amount'] || 1;

                            payMaxAmount = detailInfo[selectPayTypeVal]['pay_max_amount'] || 5000;

                            payMinAmountDom.html(payMinAmount);

                            payMaxAmountDom.html(payMaxAmount);

                            handleBalanceDom.attr('min', payMinAmount);

                            handleBalanceDom.attr('max', payMaxAmount);

                            targetDom.show();
                        }
                    }
                    else {

                        alert(LANG['pay_type_empty_error']);

                        window.history.back();
                    }
                };

            if (!empty(window.CKT.temp['payment_pay_type_detail_info'])) {

                filterFn(window.CKT.temp['payment_pay_type_detail_info']);
            }
            else {

                CKT.post(SITE_URL + 'ajax/get_payment_detail_info/?', requestFn(), function (data2Obj) {

                    var item = data2Obj['item'] || null;

                    if (!empty(item['payment_pay_type_detail_info'])) {

                        window.CKT.temp['payment_pay_type_detail_info'] = item['payment_pay_type_detail_info'];

                        filterFn(item['payment_pay_type_detail_info']);
                    }
                });
            }
        }
    });

    window.CKT.extend('prepare', {

        //检查会员条款
        check_terms: function () {

            var self = $(this),
                result = true,
                formDom = self.parents('form'),
                labelDom = formDom.find('label[for="check_terms"]');

            formDom.find('input').each(function () {

                if ($(this).is('[name="check_terms"]')) {

                    labelDom.css('color', '');

                    if (!$(this).is(':checked')) {

                        result = false;

                        labelDom.css('color', 'red');

                        alert(LANG['check_member_terms_error']);
                    }
                }
            });

            return result;
        },
        //重新寄送手机驗證碼
        resend_mobile_checkcode_item: function (dataObj) {

            var self = $(this),
                result = true,
                timeout = 60,
                cycleTimeoutFn = function () {

                    setTimeout(function () {

                        if (timeout > 0) {

                            window.CKT.temp['mobile_checkcode_wait'] = true;

                            self.attr('disabled', 'disabled');

                            self.html(LANG['sending'] + '(' + timeout + ')');

                            cycleTimeoutFn();
                        }
                        else {

                            window.CKT.temp['mobile_checkcode_wait'] = false;

                            timeout = 10;

                            self.removeAttr('disabled');

                            self.html(LANG['resend']);
                        }

                        timeout -= 1;

                    }, 1000);
                };

            if (typeof window.CKT.temp['mobile_checkcode_wait'] != 'undefined' && window.CKT.temp['mobile_checkcode_wait'] == true) {

                result = false;
            }
            else {

                result = true;
            }

            cycleTimeoutFn();

            return result;
        }
    });

    window.CKT.extend('request', {

        //取得文章ID
        get_article_id: function () {

            if (typeof window.$_GET['article-id'] != 'undefined') {

                return { 'ckt-data': window.$_GET['article-id'] };
            } else {

                window.location.href = './news.html';
            }
        },
        //取得金流商ID
        get_payment_id: function () {

            if (typeof $('select[name="payment_id"]') != 'undefined') {

                return { 'ckt-data': $('select[name="payment_id"]').val() };
            }
        }
    });

    window.CKT.extend('respond', {

        //注册 
        register: function (dataObj) {

            var self = $(this),
                formDom = self.parents('form');

            if (dataObj['result']) {

                CKT.form_reset(formDom);

                $('[ckt-event="refresh"]').trigger('refresh');

                $('[ckt-event="table_refresh"]').trigger('table_refresh');

                if (dataObj['succmsg']) {

                    alert(dataObj['succmsg']);
                }

                window.location.href = './member_center.html';
            }
            else if (dataObj['errmsg']) {

                alert(dataObj['errmsg']);
            }
        },
        //登入 
        login: function (dataObj) {
            if (dataObj['result']) {

                window.location.href = './member_center.html';
            }
            else if (dataObj['errmsg']) {

                alert(dataObj['errmsg']);
            }
        },

        //取得系统文章项目
        get_system_article_detail_item: function (dataObj) {

            var self = $(this),
                item = dataObj['item'] || dataObj;

            for (var key in item) {

                if (typeof self.find('[name="' + key + '"]') != 'undefined') {

                    self.find('[name="' + key + '"]').html(item[key]);
                }
            }
        },
        //自订表单按扭送出回调事件
        custom_form_submit: function (dataObj) {

            var self = $(this),
                tableDom = $('#target-list');

            if (tableDom.exists()) {

                tableDom.trigger('refresh');

                tableDom.trigger('table_refresh');
            }
        },
        //刷新余额动态事件
        trigger_balance_dynamic: function (dataObj) {

            $('select[name="source_gaid"]').trigger('dynamic');
            $('select[name="target_gaid"]').trigger('dynamic');
            $('#form-player_info').trigger('refresh');
        },
        //取得推广项目
        get_propose_item: function (dataObj) {

            var self = $(this),
                dataObj = dataObj['item'] || dataObj;

            self.find('[name="propose_message"]').html(dataObj['propose_message']);
            self.find('[name="propose_info"]').html(dataObj['propose_info']);
        },
        //检查登入联络项目
        check_logined_contact_item: function (dataObj) {

            var self = $('body').find('form[name="contact_form_info"]'),
                dataObj = dataObj['item'] || dataObj;

            if (self.exists()) {

                if (dataObj['result']) {

                    self.find('[name="message_realname"]').parents('div[class="col-sm-12"]').remove();
                    self.find('[name="message_mobile"]').parents('div[class="col-sm-12"]').remove();
                    self.find('[name="message_email"]').parents('div[class="col-sm-12"]').remove();
                }

                $('.chenge_captcha_image').trigger('click');
            }
        },
        //刷新在线客服资讯
        get_customer_service_info_item: function (dataObj) {

            var self = $('body').find('div[name="contact_info"]'),
                dataObj = dataObj['item'] || dataObj,
                tempDom = null,
                tempTag = null,
                tempVal = null,
                textArr = ['customer_service_email', 'customer_service_tel', 'customer_service_online', 'customer_service_lineid', 'customer_service_wechatid', 'customer_service_qqid'],
                thumbArr = ['customer_service_online_qrcode', 'customer_service_lineid_qrcode', 'customer_service_wechatid_qrcode', 'customer_service_qqid_qrcode'];

            for (var i in textArr) {

                tempTag = textArr[i];

                tempVal = dataObj[tempTag] || null;

                tempDom = self.find('[name="' + tempTag + '"]');

                if (tempVal != null && typeof tempVal != 'undefined' && tempVal != '') {

                    tempDom.html(tempVal);

                    tempTag += '_qrcode';

                    tempVal = dataObj[tempTag] || null;

                    tempDom = self.find('[name="' + tempTag + '"]');

                    if (tempVal != null && typeof tempVal != 'undefined' && tempVal != '') {

                        tempVal = dataObj[tempTag + '_thumb'] || null;

                        tempDom.html(tempVal);
                    } else {

                        tempDom.parents('li').remove();
                    }
                } else {

                    tempDom.parents('li').remove();
                }

                tempDom = tempTag = tempVal = null;
            }
        },
        //取得登入资讯
        get_logined_info_item: function (dataObj) {

            var self = $(this),
                dataObj = dataObj['item'] || dataObj,
                unloginDom = $('body').find('span[name="unlogin_info"]'),
                loginedDom = $('body').find('span[name="logined_info"]');

            unloginDom.show();
            loginedDom.hide();

            if (dataObj['result']) {

                unloginDom.hide();
                loginedDom.show();

                loginedDom.removeClass('hidden');

                loginedDom.find('span[name="logined_account"]').html(dataObj['logined_account']);
            } else {

                unloginDom.removeClass('hidden');

                unloginDom.show();
            }
        },
        //取得广告列表
        get_banner_list: function (dataObj) {

            var self = $(this),
                dataObj = dataObj['list'] || dataObj,
                content = '',
                updateBannerSize = function (targetDom) {

                    var imgDom = targetDom.find("img");

                    if (imgDom.height() > 0) {

                        self.css('height', imgDom.height() + 'px');
                        self.css('max-height', imgDom.height() + 'px');
                    }

                    imgDom.css('max-width', '100%');
                };

            if (dataObj) {

                for (var i in dataObj) {

                    if (dataObj[i]) {

                        position = dataObj[i]['banner_position'] || null;

                        if (position != null && position == '.header-banner') {

                            content += '<div class="item">';
                            content += '<a href="' + dataObj[i]['banner_href'] + '">';
                            content += '<img class="owl-lazy" data-src="' + dataObj[i]['banner_image_src'] + '" alt="" width="100%">';
                            content += '</a>';
                            content += '</div>';
                        }
                    }
                }
            }

            self.html(content).promise().done(function () {

                self.owlCarousel({
                    loop: true,
                    margin: 0,
                    dots: false,
                    nav: false,
                    autoplay: true,
                    lazyLoad: true,
                    items: 1
                }).promise().done(function () {

                    var itemDom = self.find('div .active'),
                        updateBannerSizeInterval = setInterval(function () {

                            var itemDom = self.find('div .active');

                            if (document.readyState === 'complete') {

                                updateBannerSize(itemDom);

                                clearInterval(updateBannerSizeInterval);
                            }

                        }, 100);

                    updateBannerSize(itemDom);

                    if (document.readyState === 'complete') {

                        updateBannerSize(itemDom);
                    }

                    $('window').load(function () {

                        var itemDom = self.find('div .active');

                        updateBannerSize(itemDom);
                    });
                });

                self.on('changed.owl.carousel resized.owl.carousel dragged.owl.carousel', function (event) {

                    var current = event.item.index,
                        itemDom = $(event.target).find(".owl-item").eq(current);

                    updateBannerSize(itemDom);
                });
            });
        },
        //取得跑马灯列表
        get_scrolling_text_list: function (dataObj) {

            var self = $(this),
                dataObj = dataObj['list'] || dataObj,
                content = '';

            if (dataObj) {

                content += '<ul>';

                for (var i in dataObj) {

                    if (dataObj[i]) {

                        content += '<li><p>' + dataObj[i]['scrolling_text'] + '</p></li>';
                    }
                }

                content += '</ul>';
            }

            self.html(content);
        },
        //取得游戏提供商LOGO列表
        get_game_provider_logo_list: function (dataObj) {

            var self = $(this),
                dataObj = dataObj['list'] || dataObj,
                content = '',
                num = 0;

            if (dataObj) {

                for (var i in dataObj) {

                    if (dataObj[i]) {

                        if (num % 3 == 0) {

                            content += '<div class="row">';
                        }

                        if (typeof dataObj[i]['provider_logo_src'] != 'undefined') {

                            content += '<div class="col-sm-4">';
                            content += '<div class="index-item-logo">';
                            content += '<img src="resource/image/lazyload-default.gif" class="lazy" data-src="' + dataObj[i]['provider_logo_src'] + '"' + (dataObj[i]['provider_logo_hover_src'] ? ' ' + dataObj[i]['provider_logo_hover_src'] : '') + '" alt="">';
                            content += '</div>';
                            content += '</div>';
                        }

                        if (num % 3 == 2 || typeof dataObj[parseInt(i) + 1] == 'undefined') {

                            content += '</div>';
                        }

                        num++;
                    }
                }
            }

            self.html(content).promise().done(function () {

                self.find("img.lazy").Lazy({

                    effect: 'fadeIn',
                    afterLoad: function (element) {
                        $(this).css('width', '100%');
                    }
                });
            });
        },
        //取得游戏类型游戏商列表
        get_game_category_provider_list: function (dataObj) {

            var self = $(this),
                isLogined = dataObj['is_logined'] || false,
                dataObj = dataObj['list'] || dataObj,
                content = '',
                num = 0,
                check = false,
                offset_val = null;

            if (dataObj) {

                switch (ACTION) {

                    case 'other-gaming':

                        for (var i in dataObj) {

                            if (dataObj[i]) {

                                check = true;

                                content += '<section class="product">';
                                content += '<div class="container">';
                                content += '<div class="row">';
                                content += '<div class="col-md-12">';
                                content += '<div class="product-panel">';
                                content += '<div class="product-list-left">';
                                content += '<div class="product-list-img"><img src="resource/image/lazyload-default.gif" class="lazy" data-src="' + dataObj[i]['provider_logo_src'] + '" src-hover="' + dataObj[i]['provider_logo_hover_src'] + '" alt=""></div>';
                                if (isLogined) {

                                    content += '<div class="product-list-btn"><button class="btn btn-orange btn-product" ckt-event="ajax" ckt-data="' + dataObj[i]['gpid'] + '" ckt-url="' + SITE_URL + 'ajax/api_process_login_game/?" ckt-respond="api_respond" ckt-async="false">' + LANG['play_game'] + '</button></div>';
                                } else {
                                    content += '<div class="product-list-btn"><a href="./login.html"><button class="btn btn-orange btn-product">' + LANG['play_game'] + '</button></a></div>';
                                }
                                content += '</div>';
                                content += '<div class="product-list-right">';
                                content += '<div class="product-list-title">' + dataObj[i]['provider_name'] + '</div>';
                                content += '<div class="product-list-text">';
                                content += dataObj[i]['provider_content'];
                                content += '</div>';
                                content += '</div>';
                                content += '</div>';
                                content += '</div>';
                                content += '</div>';
                                content += '</div>';
                                content += '</section>';
                            }
                        }

                        break;

                    default:

                        content += '<section class="product">';
                        content += '<div class="container">'

                        for (var i in dataObj) {

                            if (dataObj[i]) {

                                check = true;

                                if (Object.keys(dataObj).length > 1) {

                                    offset_val = '';
                                }
                                else {

                                    offset_val = ' col-md-offset-3';
                                }

                                if (num % 2 == 0) {

                                    content += '<div class="row">';
                                }

                                content += '<div class="col-md-6 ' + offset_val + '">';
                                content += '<div class="product2-item">';
                                content += '<div class="product2-item-img">';
                                content += '<img src="resource/image/lazyload-default.gif" class="lazy" data-src="' + dataObj[i]['provider_image_src'] + '" src-hover="' + dataObj[i]['provider_image_hover_src'] + '" alt="" width="100%">';
                                content += '</div>';
                                content += '<div class="product2-item-intro">';
                                content += '<div class="product2-item-intro-title">' + dataObj[i]['provider_name'] + '</div>';
                                content += '<div class="product2-item-intro-text">';
                                content += dataObj[i]['provider_content'];
                                content += '</div>';
                                content += '<div class="text-center">';
                                if (isLogined) {

                                    content += '<button class="btn btn-orange btn-product" ckt-event="ajax" ckt-data="' + dataObj[i]['gpid'] + '" ckt-url="' + SITE_URL + 'ajax/api_process_login_game/?" ckt-respond="api_respond" ckt-async="false">' + LANG['play_game'] + '</button>';
                                } else {
                                    content += '<a href="./login.html"><button class="btn-orange btn-product">' + LANG['play_game'] + '</button></a>';
                                }
                                content += '</div>';
                                content += '</div>';
                                content += '</div>';
                                content += '</div>';

                                if (num % 2 == 1 || typeof dataObj[parseInt(i) + 1] == 'undefined') {

                                    content += '</div>';
                                }

                                num++;

                            }
                        }

                        content += '</div>';
                        content += '</section>';

                        break;
                }
            }

            if (check) {

                self.html(content).promise().done(function () {

                    self.removeClass('hidden');
                    self.show();
                    self.find("img.lazy").Lazy({

                        effect: 'fadeIn'
                    });
                });
            }
        },
        //取得游戏类试玩列表
        get_game_demo_list: function (dataObj) {

            var self = $(this),
                dataObj = dataObj['list'] || dataObj,
                content = '',
                num = 0;

            if (dataObj) {

                content += '<section class="product"><div class="container">';

                for (var i in dataObj) {

                    if (dataObj[i]) {

                        if (num % 3 == 0) {

                            content += '<div class="row">';
                        }

                        content += '<div class="col-sm-4">';
                        content += '<div class="product-item">';
                        content += '<div class="product-item-img">';
                        content += '<img src="resource/image/lazyload-default.gif" class="lazy" data-src="' + dataObj[i]['demo_image_src'] + '" src-hover="' + dataObj[i]['demo_image_hover_src'] + '" alt="" class="active">';
                        content += '</div>';
                        content += '<div class="product-item-title">';
                        content += dataObj[i]['demo_name'];
                        content += '</div>';
                        content += '<div class="product-item-note">';
                        content += dataObj[i]['demo_note'] || '';
                        content += '</div>';
                        content += '<a target="_blank" href="' + dataObj[i]['demo_href'] + '"><button class="btn-orange btn-product">' + LANG['play_demo_game'] + '</button></a>';
                        content += '</div>';
                        content += '</div>';

                        if (num % 3 == 2 || typeof dataObj[parseInt(i) + 1] == 'undefined') {

                            content += '</div>';
                        }

                        num++;
                    }
                }

                content += '</div></section>';
            } else {

                self.hide();
            }

            self.html(content).promise().done(function () {

                self.find("img.lazy").Lazy({

                    effect: 'fadeIn'
                });
            });
        },
        //取得帮助中心列表
        get_help_list: function (dataObj) {

            var self = $(this),
                list = dataObj['list'] || null,
                menusContent = '',
                bodyContent = '',
                content = '',
                pagination = dataObj['pagination'] || null;

            if (list) {

                menusContent += '<div class="col-md-3 nopadding-r"><ul class="ul-help">';

                bodyContent += '<div class="col-md-9 nopadding-l"><div class="help-container">';

                for (var i in list) {

                    menusContent += '<li data="#help-' + list[i]['id'] + '">' + list[i]['article_title'] + '</li>';

                    bodyContent += '<div id="help-' + list[i]['id'] + '" class="help-container-block"><div class="help-container-block-text">';

                    bodyContent += list[i]['article_content'];

                    bodyContent += '</div></div>';
                }

                menusContent += '</ul></div>';

                bodyContent += '</div></div>';

                content = menusContent + bodyContent;

            } else {

                self.hide();
            }

            self.html(content).promise().done(function () {
                console.log("self.html(content).promise().done");
                self.find(".ul-help li").first().addClass("active");

                self.find(".ul-help li").click(function (event) {

                    var thisDom = $(this),
                        targetDom = $(thisDom.attr('data'));

                    self.find(".ul-help li").removeClass("active");
                    thisDom.addClass("active");
                    self.find(".help-container-block").hide();
                    targetDom.fadeIn(400);
                });
            });
        },
        //取得优惠活动列表
        get_news_list: function (dataObj) {

            var self = $(this),
                list = dataObj['list'] || null,
                listDom = self.find('.news-list'),
                content = '',
                pagination = dataObj['pagination'] || null;

            if (list) {

                for (var i in list) {

                    content += '<li class="animated fadeInUp">';
                    content += '<a href="./news_detail.html?article-id=' + list[i]['id'] + '">';
                    content += '<div class="news-list-img"><img src="' + list[i]['article_thumbnails_src'] + '" alt=""></div>';
                    content += '<div class="news-list-text">';
                    content += '<div class="news-list-date">' + list[i]['modify_datetime'] + '</div>';
                    content += '<div class="news-list-title">' + list[i]['article_title'] + '</div>';
                    content += '</div>';
                    content += '</a>';
                    content += '</li>';
                }
            } else {

                self.hide();
            }

            listDom.html(content).promise().done(function () {

                CKT.build_page_menus(pagination, self);
            });
        },
        get_news_table: function (dataObj) {

            var self = $(this),
                list = dataObj['list'] || null,
                listDom = self.find('.news-table'),
                content = '',
                pagination = dataObj['pagination'] || null;

            if (list) {

                for (var i in list) {

                    content += '<tr>';
                    content += '<th scope="row" class="table-day">' + list[i]['modify_datetime'].split(" ")[0] + '</th>';
                    content += '<td>' + list[i]['article_title'] + '</td>';
                    content += '<td><a href="./news_detail.html?article-id=' + list[i]['id'] + '">查看</a></td>';
                    content += '</tr>';
                }
            } else {

                self.hide();
            }

            self.html(content).promise().done(function () {
                CKT.build_page_menus(pagination, self);
            });
        },
        //取得优惠活动资讯
        get_news_detail_item: function (dataObj) {

            var self = $(this),
                item = dataObj['item'] || dataObj;

            for (var key in item) {

                if (typeof self.find('[name="' + key + '"]') != 'undefined') {

                    self.find('[name="' + key + '"]').html(item[key]);
                }
            }
        },
        //刷新会员条款
        get_member_rules_item: function (dataObj) {

            var self = $(this),
                dataObj = dataObj['item'] || dataObj;

            if (dataObj['member_rules']) {

                self.html(dataObj['member_rules']);
            }
        },
        //刷新会员列表
        refresh_member_list: function (dataObj) {

            var self = $(this),
                targetDom = typeof self.attr('ckt-target') != 'undefined' ? $(self.attr('ckt-target')) : self,
                list = dataObj['list'] || null,
                listDom = targetDom.find('.member-list > ul'),
                listCloneDom = null,
                listTempDom = null,
                pagination = dataObj['pagination'] || null;

            listDom.find('li').each(function () {

                if ($(this).hasClass('li-title')) {

                    listCloneDom = $(this).clone();

                    listCloneDom.removeClass('li-title');

                    listCloneDom.find('li').removeAttr('field');
                } else {

                    $(this).remove();
                }
            });

            if (list) {

                for (var i in list) {
                    if (list[i] && listCloneDom) {

                        listTempDom = listCloneDom.clone();

                        listTempDom.find("[field]").each(function () {

                            var field = '',
                                temp = '',
                                content = '';

                            field = $(this).attr('field');

                            temp = list[i][field] || null;

                            if (field != '') {

                                if (field == 'handle') {

                                    if (temp != '' && is_array(temp)) {

                                        for (var j in temp) {

                                            content += '<button class="btn-orange"';

                                            if (typeof temp[j]['ckt-event'] != 'undefined') {

                                                content += ' ckt-event="' + temp[j]['ckt-event'] + '"';

                                                if (typeof temp[j]['ckt-url'] != 'undefined') {

                                                    content += ' ckt-url="' + temp[j]['ckt-url'] + '"';
                                                }

                                                if (typeof temp[j]['ckt-data'] != 'undefined') {

                                                    content += ' ckt-data="' + temp[j]['ckt-data'] + '"';
                                                }

                                                if (typeof temp[j]['ckt-prepare'] != 'undefined') {

                                                    content += ' ckt-prepare="' + temp[j]['ckt-prepare'] + '"';
                                                }

                                                if (typeof temp[j]['ckt-request'] != 'undefined') {

                                                    content += ' ckt-request="' + temp[j]['ckt-request'] + '"';
                                                }

                                                if (typeof temp[j]['ckt-respond'] != 'undefined') {

                                                    content += ' ckt-respond="' + temp[j]['ckt-respond'] + '"';
                                                }

                                                if (typeof temp[j]['ckt-target'] != 'undefined') {

                                                    content += ' ckt-target="' + temp[j]['ckt-target'] + '"';
                                                }

                                                if (typeof temp[j]['ckt-form'] != 'undefined') {

                                                    content += ' ckt-form="' + temp[j]['ckt-form'] + '"';
                                                }

                                                if (typeof temp[j]['ckt-refresh'] != 'undefined') {

                                                    content += ' ckt-refresh="' + temp[j]['ckt-refresh'] + '"';
                                                }

                                                if (typeof temp[j]['ckt-async'] != 'undefined') {

                                                    content += ' ckt-async="' + temp[j]['ckt-async'] + '"';
                                                }
                                            }

                                            content += '>';
                                            content += temp[j]['ckt-name'].replace("登入遊戲", "登入平台");
                                            content += '</button>&nbsp;';
                                        }
                                    } else {

                                        content += '-';
                                    }
                                } else if (temp != '') {

                                    content = temp;
                                }
                            }
                            $(this).html(content);
                        });

                        console.error(listTempDom);
                        listDom.append(listTempDom);

                    }
                }
                //fake data
                listDom.append('<li class=""><div field="provider_name" class="kind w-20">台股綜合指數</div><div field="provider_currency" class="currency w-10">TWD</div><div field="game_balance_format" class="point w-20">維護中</div><div field="game_acc_and_pwd" class="game_acc_and_pwd w-30"></div><div field="handle" class="action w-40"><button class="btn-orange">登入平台</button>&nbsp;</div></li>');
                listDom.append('<li class=""><div field="provider_name" class="kind w-20">上海A/B股</div><div field="provider_currency" class="currency w-10">TWD</div><div field="game_balance_format" class="point w-20">維護中</div><div field="game_acc_and_pwd" class="game_acc_and_pwd w-30"></div><div field="handle" class="action w-40"><button class="btn-orange">登入平台</button>&nbsp;</div></li>');
                listDom.append('<li class=""><div field="provider_name" class="kind w-20">重金屬期貨</div><div field="provider_currency" class="currency w-10">TWD</div><div field="game_balance_format" class="point w-20">維護中</div><div field="game_acc_and_pwd" class="game_acc_and_pwd w-30"></div><div field="handle" class="action w-40"><button class="btn-orange">登入平台</button>&nbsp;</div></li>');
                listDom.append('<li class=""><div field="provider_name" class="kind w-20">那斯達克綜合指數</div><div field="provider_currency" class="currency w-10">TWD</div><div field="game_balance_format" class="point w-20">維護中</div><div field="game_acc_and_pwd" class="game_acc_and_pwd w-30"></div><div field="handle" class="action w-40"><button class="btn-orange">登入平台</button>&nbsp;</div></li>');
            }

            CKT.build_page_menus(pagination, targetDom);
        },
        //关闭弹跳视窗
        float_paenl_remove: function () {
            $('.float-paenl').find('[ckt-event="dynamic"]').trigger('dynamic');
            $(".float-paenl").removeClass("active");
            $(".float-paenl-black").removeClass("in");
            $(".float-paenl-body").removeClass("in");
        },
        refresh_html: function () {
            window.location.reload();
        },
        //刷新银行列表
        trigger_bank_code: function () {

            var self = $(this);

            $('select[name="bank_code"]').trigger('dynamic_ajax');

            self.change(function () {

                $('select[name="bank_code"]').trigger('dynamic_ajax');
            });
        },
        //刷新超商列表
        trigger_market_code: function () {

            var self = $(this);

            $('select[name="market_code"]').trigger('dynamic_ajax');

            self.change(function () {

                $('select[name="market_code"]').trigger('dynamic_ajax');
            });
        },
        //刷新付款方式
        trigger_pay_type: function () {

            var self = $(this);

            $('select[name="pay_type"]').trigger('dynamic_ajax');

            self.change(function () {

                $('select[name="pay_type"]').trigger('dynamic_ajax');
            });
        },
        //过滤金流付款详细
        filter_pay_type_detail_info: function () {

            CKT.filter_pay_type_change();

            $('select[name="pay_type"]').change(CKT.filter_pay_type_change);
        },
        //取得线下存款详细
        get_offline_pay_detail_info: function (dataObj) {

            var self = $(this),
                item = dataObj['item'] || null,
                detailInfo = typeof item != 'undefined' ? item['payment_offline_pay_detail_info'] : {},
                targetDom = $('[name="offline_pay_detail_info"]'),
                messageDom = targetDom.find('[name="pay_notice_message"]'),
                payMinAmount = 100,
                payMaxAmount = 10000,
                payMinAmountDom = targetDom.find('span[name="pay_min_amount"]'),
                payMaxAmountDom = targetDom.find('span[name="pay_max_amount"]'),
                handleBalanceDom = targetDom.find('input[name="handle_balance"]'),
                customerPayInfoArray = ['customer_bank_name', 'customer_bank_branches', 'customer_bank_code', 'customer_bank_number', 'customer_bank_account', 'customer_pay_qrcode_thumb'],
                customerPayInfoMessageDom = targetDom.find('div[name="customer_pay_info_message"]');

            payMessage = typeof detailInfo['pay_notice_message'] != 'undefined' ? detailInfo['pay_notice_message'] : '';

            messageDom.html(payMessage);

            payMinAmount = typeof detailInfo['pay_min_amount'] != 'undefined' ? detailInfo['pay_min_amount'] : 100;

            payMaxAmount = typeof detailInfo['pay_max_amount'] != 'undefined' ? detailInfo['pay_max_amount'] : 10000;

            payMinAmountDom.html(payMinAmount);

            payMaxAmountDom.html(payMaxAmount);

            handleBalanceDom.attr('min', payMinAmount);

            handleBalanceDom.attr('max', payMaxAmount);

            customerPayInfoMessageDom.hide();

            if (isset(item['customer_pay_info_op']) && parseInt(item['customer_pay_info_op']) == 1) {

                for (num in customerPayInfoArray) {

                    (function () {

                        var _dom = targetDom.find('[name="' + customerPayInfoArray[num] + '"]');

                        if (isset(item[customerPayInfoArray[num]]) && trim(item[customerPayInfoArray[num]]) !== '') {

                            _dom.html(item[customerPayInfoArray[num]]);
                        }
                        else {

                            _dom.parent().hide();
                        }
                    })();
                }

                customerPayInfoMessageDom.show();
            }

            targetDom.show();
        },
        //取得金流代出款详细
        get_payout_detail_info: function (dataObj) {

            var self = $(this),
                item = dataObj['item'] || null,
                detailInfo = typeof item != 'undefined' ? item['payment_payout_detail_info'] : {},
                targetDom = $('[name="payout_detail_info"]'),
                messageDom = targetDom.find('[name="payout_notice_message"]'),
                payoutMinAmount = 100,
                payoutMaxAmount = 10000,
                payoutMinAmountDom = targetDom.find('span[name="payout_min_amount"]'),
                payoutMaxAmountDom = targetDom.find('span[name="payout_max_amount"]'),
                handleBalanceDom = targetDom.find('input[name="handle_balance"]');

            payoutMessage = typeof detailInfo['payout_notice_message'] != 'undefined' ? detailInfo['payout_notice_message'] : '';

            messageDom.html(payoutMessage);

            payoutMinAmount = typeof detailInfo['payout_min_amount'] != 'undefined' ? detailInfo['payout_min_amount'] : 100;

            payoutMaxAmount = typeof detailInfo['payout_max_amount'] != 'undefined' ? detailInfo['payout_max_amount'] : 10000;

            payoutMinAmountDom.html(payoutMinAmount);

            payoutMaxAmountDom.html(payoutMaxAmount);

            handleBalanceDom.attr('min', payoutMinAmount);

            handleBalanceDom.attr('max', payoutMaxAmount);

            targetDom.show();
        },
        //产生导航列
        build_nav_menus: function (dataObj) {

            var dataObj = dataObj['list'] || null;

            if (dataObj != null) {

                for (var targetSelector in dataObj) {

                    (function () {

                        var targetDom = $(targetSelector),
                            menus = dataObj[targetSelector] || null,
                            content = '';

                        if (menus != null) {

                            for (var i in menus) {

                                (function () {

                                    var href_open_target = menus[i]['href_open_target'] || '_self',
                                        href_code = menus[i]['href_code'] || null,
                                        name = menus[i]['name'] || null,
                                        href = menus[i]['href'] || '#',
                                        icon_src = typeof menus[i]['icon_src'] != 'undefined' && menus[i]['icon_src'] != null && menus[i]['icon_src'] != '' ? menus[i]['icon_src'] : './images/' + href_code + '.svg',
                                        alt = name || '';

                                    // content += '<li><a target="' + href_open_target + '" href="' + href + '">';
                                    content += '<div class="game-item-block"><a target="' + href_open_target + '" href="' + href + '">';

                                    if (in_array(targetSelector, ['.ckt-main-menus', '.ckt-mobile-main-menus'])) {

                                        if (targetSelector == '.ckt-main-menus') {

                                            // content += '<div class="nav-icon">';
                                            // content += '<div class="nav-icon">';
                                        }
                                        else {

                                            // content += '<div class="mobile-index-icon">';
                                        }

                                        if (typeof icon_src != 'undefined' && icon_src != '') {

                                            content += '<img src="' + icon_src + '">';
                                        }

                                        // content += '</div>';
                                    }

                                    content += '<h4>' + name + '</h4>';
                                    content += '</a></div>';

                                })();
                            }

                            targetDom.html(content);
                        }
                    })();
                }
            }
        }
    });
}