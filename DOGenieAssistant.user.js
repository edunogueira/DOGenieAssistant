// ==UserScript==
// @name         DO Genie Assistant
// @version      29.0
// @namespace    https://github.com/edunogueira/DOGenieAssistant/
// @description  dugout-online genie assistant
// @author       Eduardo Nogueira de Oliveira
// @icon         https://www.google.com/s2/favicons?domain=dugout-online.com
// @require	 http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require      https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js
// @include      http*dugout-online.com/*
// @include      https://www.dugout-online.com/*
// ==/UserScript==
//page select ----------------------------------------------//
var page = document.URL;
var configs = getStorage(localStorage.getItem("DOGenieAssistant.configs")) || {};
var soundConfig = getSoundStorage(localStorage.getItem("DOGenieAssistant.soundConfig")) || {};

function checkAndExecute(config, func) {
    if ((config) || (typeof config === 'undefined')) {
        func();
    }
}

checkAndExecute(configs["PAGE_TITLE"], pageTitle);
checkAndExecute(configs["DROPDDOWN_MENU"], dropdownMenu);
checkAndExecute(configs["SECONDARY_CLOCK"], secondaryClock);

if (page.includes('/home/none/')) {
    configMenu();
    configSound();
    clearStorage();
    clearMatchStorage();
    clearPlayerImages();

    if (configs["TEAM_LINK"]) {
        teamLink();
    }
    if (configs["GET_SPONSORS"]) {
        getSponsors();
    }
} else if (page.includes('/search_coaches/none/')) {
    checkAndExecute(configs["COACHES_WAGE"], coachesWage);
} else if (page.includes('/clubinfo/none/clubid/')) {
    checkAndExecute(configs["READ_RESUME"], readResume);
} else if (page.includes('/clubinfo/none/')) {
    checkAndExecute(configs["SCOUT_BUTTON"], scoutButton);
} else if (page.includes('/players/details/')) {
    playerDetails();
    checkAndExecute(configs["BID_BUTTON"], bidButton);
    checkAndExecute(configs["PLAYER_IMAGE"], playerImage);
} else if (page.includes('/players/none/') || page.includes('/players_nt/none/')) {
    checkAndExecute(configs["SQUAD_DETAILS"], squadDetails);
    checkAndExecute(configs["SQUAD_FILTERS"], squadFilters);
} else if (page.includes('/tactics/none/') || page.includes('/tactics_youth/none/') || page.includes('/tactics_nt/none/')) {
    checkAndExecute(configs["TACTICS_DETAILS"], tacticsDetails);
    checkAndExecute(configs["LOAD_TACTICS"], loadTactics);
} else if (page.includes('/players/spreadsheet/')) {
    checkAndExecute(configs["SPREADSHEET_SQUAD"], function() { doTable('.forumline'); });
} else if (page.includes('/game/none/gameid/')) {
    checkAndExecute(soundConfig["MATCH_SOUND"], matchSound);
}


//helper //----------------------------------------------//
function serverTime() {
    const d = new Date();
    const time = `${addZero(d.getHours())}:${addZero(d.getMinutes())}:${addZero(d.getSeconds())}`;
    $('#servertime2').text(time);
}

function addZero(i) {
    return i < 10 ? "0" + i : i;
}

function applyStyle(css) {
    const head = document.head || document.getElementsByTagName('head')[0];

    if (head) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        head.appendChild(style);
    }
}

function getExp() {
    return $('div[title]')
        .map(function() {
            var titleString = $(this).attr('title');
            return /^\d+ XP$/.test(titleString) ? titleString : null;
        })
        .get();
}

function getPos() {
    var posArray = Array.from({ length: 10 }, function() { return "0"; });

    var mainDiv = document.querySelector('img[src*="positions-field"]').parentNode;

    var positions = [
        { top: "69px", left: "10px", index: 0 }, // GK
        { top: "20px", left: "40px", index: 1 }, // DL
        { top: "69px", left: "40px", index: 2 }, // DC
        { top: "117px", left: "40px", index: 3 }, // DR
        { top: "20px", left: "108px", index: 4 }, // ML
        { top: "69px", left: "108px", index: 5 }, // MC
        { top: "117px", left: "108px", index: 6 }, // MR
        { top: "20px", left: "185px", index: 7 }, // FL
        { top: "69px", left: "185px", index: 8 }, // FC
        { top: "117px", left: "185px", index: 9 } // FR
    ];

    positions.forEach(function (pos) {
        var posDiv = Array.from(mainDiv.querySelectorAll('div[style*="background"]')).find(function (div) {
            return div.style.top === pos.top && div.style.left === pos.left;
        });

        if (posDiv) {
            var img = posDiv.style.background;
            var num = img.substring(img.indexOf("positions-") + "positions-".length, img.indexOf(".png"));
            posArray[pos.index] = num;
        }
    });

    return posArray;
}

function getOPS(data) {
    var ops = [];
    var positions = [
        [0, 5, 10, 15, 13],
        [16, 6, 1, 15, 13],
        [6, 11, 1, 15, 13],
        [16, 6, 1, 15, 13],
        [16, 17, 7, 2, 13],
        [12, 17, 7, 2, 13],
        [16, 17, 7, 2, 13],
        [3, 8, 17, 16, 13],
        [3, 8, 17, 11, 13],
        [3, 8, 17, 16, 13],
        [1, 6, 7, 2, 13],
        [12, 2, 7, 3, 8]
    ];

    ops['pos'] = 0;

    for (var i = 0; i < positions.length; ++i) {
        ops[i] = positions[i].reduce(function(sum, index) {
            return sum + data[index];
        }, 0);

        if (isNaN(ops[i])) {
            ops[i] = 0;
        }

        if (ops[i] >= ops[ops['pos']]) {
            ops['pos'] = i;
        }
    }

    return ops;
}

function doTable(selector) {
    $(selector + ' tr:first td').wrapInner('<div />').find('div').unwrap().wrap('<th/>');
    var header = $(selector + " .table_top_row:first").clone();
    $(selector + " .table_top_row:first").remove();
    $(selector + " tbody:first").before('<thead></thead>');
    $(selector + " thead:first").append(header);

    if ((configs["SQUAD_FILTERS"]) || (typeof configs["SQUAD_FILTERS"] === 'undefined')) {
        $(selector).dataTable({
            "searching": true,
            "bPaginate": false,
            "bLengthChange": false,
            "bFilter": false,
            "bInfo": false,
            "bAutoWidth": false,
            "order": [
                [$(selector + ' .table_top_row th').size() - 1, "desc"]
            ]
        });
    } else {
        $(selector).dataTable({
            "searching": false,
            "bPaginate": false,
            "bLengthChange": false,
            "bFilter": false,
            "bInfo": false,
            "bAutoWidth": false,
            "order": [
                [$(selector + ' .table_top_row th').size() - 1, "desc"]
            ]
        });
    }
}

//features //----------------------------------------------//
function playerDetails() {
    let attrText = '';
    var data = Array();

    $("#main-1 table tr").each(function(i, v) {
        $(this).children('td').each(function(ii, vv) {
            if ($.isNumeric($(this).text())) {
                data.push(parseInt($(this).text()));
            }
        });
    });
    var ops = getOPS(data);
    var position = getPos();
    var natPos = 0;

    for (var i = 0; i < position.length; ++i) {
        if (position[i] == 1) {
            natPos = i;
        }
    }
    if (ops['pos'] !== natPos) {
        attrText = ' @ OPS ' + ops[natPos] + '/' + ops[ops['pos']] + '*';
    } else {
        attrText = ' @ OPS ' + ops[natPos];
    }

    const exp = getExp();

    if (configs["PLAYER_OPS_ID"] !== "") {
        $('.player_id_txt').text($('.player_id_txt').text() + attrText);
    }

    if (configs["PLAYER_OPS_NAME"] !== "") {
        $('.player_name').text($('.player_name').text() + attrText);
        $('.player_id_txt').css({
            'position': 'absolute',
            'right': '30px'
        });
    }

    if (configs["PLAYER_EXP"] !== "") {
        const expText = ' | ' + exp;

        if (configs["PLAYER_OPS_NAME"] !== "") {
            $('.player_name').text($('.player_name').text() + expText);
        }

        if (configs["PLAYER_OPS_ID"] !== "") {
            $('.player_id_txt').text($('.player_id_txt').text() + expText);
        }
    }

    if (configs["PAGE_TITLE"] !== "") {
        $(document).prop('title', $('.player_name').text() + attrText);
    }
}

function squadDetails() {
    $(".forumline .table_top_row").each(function() {
        const headerRow = $(this).last();
        headerRow.append('<td align="center" width="20" title="Original Position Skills" class="tableHeader">OPS</td>');
        if (configs["SQUAD_HIGH"] !== "") {
            headerRow.append('<td align="center" width="20" title="Best Original Position Skills" class="tableHeader">HIGH</td>');
        }
    });

    $(".forumline [class*=matches_row]").each(function() {
        const data = Array();
        let count = 0;
        $(this).find(".tableHeader").remove();

        $(this).find("tr").each(function() {
            $(this).children('td').each(function() {
                if ($.isNumeric($(this).text())) {
                    data.push(parseInt($(this).text()));
                } else {
                    count++;
                }
            });
        });

        if (data.length > 0) {
            const position = $(this).find(" [class*=_icon]").text();
            const ops = getOPS(data);
            const natPos = getPositionIndex(position);

            $(this).last().append('<td align="center"><span class="tableText">' + ops[natPos] + '</span></td>');

            if (configs["SQUAD_HIGH"] !== "") {
                const highOps = ops[ops['pos']];
                const cellText = highOps > ops[natPos] ? '<strong>' + highOps + '</strong>' : highOps;
                $(this).last().append('<td align="center"><span class="tableText">' + cellText + '</span></td>');
            }
        } else if (count > 1) {
            $(this).last().append('<td align="center"><span class="tableText">0</span></td>');
            if (configs["SQUAD_HIGH"] !== "") {
                $(this).last().append('<td align="center"><span class="tableText">0</span></td>');
            }
        }
    });
    var tables = document.querySelectorAll("[class=forumline]");
    tables[0].classList.add("gks");
    tables[1].classList.add("dcs");
    tables[2].classList.add("mcs");
    tables[3].classList.add("pls");
    doTable('.forumline.gks');
    doTable('.forumline.dcs');
    doTable('.forumline.mcs');
    doTable('.forumline.pls');
}

function squadFilters () {
    $("#top_positions").before('<table class="inputs"><tbody><tr><td>Min Age</td><td><input type="search" id="minAge" name="minAge"></td><td>Min Rat</td><td><input type="search" id="minRat" name="minRat"></td><td>Min OPS</td><td><input type="search" id="minOPS" name="minOPS"></td><td><button id="clearButton" onclick="">Clear Fields</button></td></tr><tr><td>Max Age</td><td><input type="search" id="maxAge" name="maxAge"></td><td>Max Rat</td><td><input type="search" id="maxRat" name="maxRat"></td><td>Max OPS</td><td><input type="search" id="maxOPS" name="maxOPS"></td></tr></tbody></table>');

    $('#clearButton').on('click', function() {
        $('input[type="search"]').val('').change();;
        $('.forumline').DataTable().search('').draw();
    });

    const inputIds = ["minAge", "maxAge", "minRat", "maxRat", "minOPS", "maxOPS"];
    const inputs = inputIds.map(id => document.querySelector(`#${id}`));
    const i = (document.querySelector('.compare_players_wrapper')) ? 1 : 0;
    DataTable.ext.search.push(function (settings, data, dataIndex) {
        const [minA, maxA, age, minR, maxR, rat, minO, maxO, ops] = [
            parseInt(inputs[0].value, 10), parseInt(inputs[1].value, 10),
            parseFloat(data[3 + i]) || 0,
            parseFloat(inputs[2].value) || 0, parseFloat(inputs[3].value) || Number.POSITIVE_INFINITY,
            parseFloat(data[5 + i]) || 0,
            parseFloat(inputs[4].value) || 0, parseFloat(inputs[5].value) || Number.POSITIVE_INFINITY,
            parseFloat(data[6 + i]) || 0
        ];

        if (
            (isNaN(minA) || minA <= age) &&
            (isNaN(maxA) || age <= maxA) &&
            (isNaN(minR) || minR <= rat) &&
            (isNaN(maxR) || rat <= maxR) &&
            (isNaN(minO) || minO <= ops) &&
            (isNaN(maxO) || ops <= maxO)
        ) {
            return true;
        }

        return false;
    });

    inputs.forEach(input => {
        input.addEventListener('input', function () {
            $('.forumline').DataTable().draw();
        });
    });
}

function getPositionIndex(position) {
    switch (position) {
        case "GK": return 0;
        case "DL": return 1;
        case "DC": return 2;
        case "DR": return 3;
        case "ML": return 4;
        case "MC": return 5;
        case "MR": return 6;
        case "FL": return 7;
        case "FC": return 8;
        case "FR": return 9;
        default: return 0;
    }
}

function tacticsDetails() {
    $('td').css('color', 'unset');
    var players = Array();
    $("#capitan_sel > option").each(function() {
        players.push(this.value);
    });

    var subs = Array();
    $("#sub_with > option").each(function() {
        subs.push(this.value);
    });

    $(".player").each(function() {
        var data = Array();
        var i = 0;
        var decoration = false;
        var subdecoration = false;
        var playerId = $(this).attr('rel').split('|')[0];

        $.each(players, function(key, value) {
            if (value == playerId) {
                decoration = true;
                return false;
            }
        });

        var div = null;
        if (decoration == true) {
            $(this).parent().parent().css('text-decoration', 'underline');
            $(this).parent().parent().css('font-weight', 'bold');
        }

        $.each(subs, function(key, value) {
            if (value == playerId) {
                subdecoration = true;
                return false;
            }
        });
        if (subdecoration == true) {
            $(this).parent().parent().css('font-weight', 'bold');
            $(this).parent().parent().css('color', 'blue');
            $(this).css('color', 'blue');
        }

        $("#" + playerId + " table tr").each(function() {
            $(this).children('td').each(function() {
                if ($.isNumeric($(this).text())) {
                    data.push(parseInt($(this).text()));
                    i++;
                } else if (i == 21) {
                    $(this).append("OPS");
                    $(this).css("font-size", "12px");
                    i++;
                } else if (i == 22) {
                    $(this).append("0");

                    $(this).css({
                        "font-size": "12px",
                        "font-weight": "bold"
                    });
                    $(this).addClass("ops");
                    i++;
                }
            });
        });

        if (data.length > 0) {
            var array = $(this).parent().next().map(function() {
                return $.trim($(this).text());
            }).get();
            var position = array[0];
            var ops = 0;

            if (position == "GK") {
                ops = (data[0] + data[5] + data[10] + data[15] + data[13]);
            } else if (position == "DC") {
                ops = (data[6] + data[11] + data[1] + data[15] + data[13]);
            } else if ((position == "DL") || (position == "DR")) {
                ops = (data[16] + data[6] + data[1] + data[15] + data[13]);
            } else if ((position == "ML") || (position == "MR")) {
                ops = (data[16] + data[17] + data[7] + data[2] + data[13]);
            } else if (position == "MC") {
                ops = (data[12] + data[17] + data[7] + data[2] + data[13]);
            } else if ((position == "FL") || (position == "FR")) {
                ops = (data[3] + data[8] + data[17] + data[16] + data[13]);
            } else if (position == "FC") {
                ops = (data[3] + data[8] + data[17] + data[11] + data[13]);
            }

            $("#" + playerId + " .ops").text(ops);
        }
    });
}

function secondaryClock() {
    $('#footer').append('<div class="time_display" id="servertime2" style="top: 12px;border:1px solid #fff"></div>');
    setInterval(serverTime, 1000);
}

function getLanguage() {
    const settingsTitle = document.querySelector(".settings_button").title;
    const languages = {
        Postavke: "bh",
        Settings: "en",
        Configuraciones: "sp",
        Impostazioni: "it",
        Instellingen: "du",
        Configurações: "br",
        Setări: "ro",
        Nastavitve: "si",
        Ayarlar: "tu",
        설정: "sk",
    };
    return languages[settingsTitle];
};

function dropdownMenu() {
    var css = '.dropdown-content{text-align: left;top:0px;border-radius: 15px;margin-top:40px;display:none;position:absolute;background-color:#f1f1f1;min-width:160px;box-shadow:0 8px 16px 0 rgba(0,0,0,.2);z-index:1}.dropdown-content a{border-radius: 15px;color:#000;padding:12px 16px;text-decoration:none;display:block}.dropdown-content a:hover{background-color:#ddd}.menu_button:hover .dropdown-content{display:block}.menu_button:hover .dropbtn{background-color:#3e8e41}';
    applyStyle(css);

    const translation = {
        home_home: {
            en: "Home",
            br: "Início"
        },
        home_news: {
            en: "News",
            br: "Notícias"
        },
        home_rules: {
            en: "Rules",
            br: "Regras"
        },
        home_help: {
            en: "Help",
            br: "Ajuda"
        },

        club_info: {
            en: "Info",
            br: "Informações"
        },
        club_bids: {
            en: "Bids",
            br: "Ofertas"
        },
        club_transfers: {
            en: "Transfers",
            br: "Transferências"
        },
        club_players: {
            en: "Players",
            br: "Jogadores"
        },
        club_players_youth: {
            en: "Players (youth)",
            br: "Jogadores (juvenil)"
        },
        scout_report: {
            en: "Scout Report",
            br: "Relatório do Espião"
        },
        club_staff: {
            en: "Staff",
            br: "Comissão Técnica"
        },
        club_settings: {
            en: "Settings",
            br: "Configurações"
        },

        players_nt: {
            en: "Players",
            br: "Jogadores"
        },
        tactics_nt: {
            en: "Tactics",
            br: "Táticas"
        },

        management_finances: {
            en: "Finances",
            br: "Finanças"
        },
        management_stadium: {
            en: "Stadium",
            br: "Estádio"
        },
        management_facilities: {
            en: "Facilities",
            br: "Instalações"
        },
        management_sponsors: {
            en: "Sponsors",
            br: "Patrocinadores"
        },
        management_calendar: {
            en: "Calendar",
            br: "Calendário"
        },

        tactics_fiest: {
            en: "Tactics",
            br: "Táticas"
        },
        tactics_youth: {
            en: "Tactics (youth)",
            br: "Táticas (juvenil)"
        },

        training_training: {
            en: "Training",
            br: "Treinamento"
        },
        training_physios: {
            en: "Physios",
            br: "Fisioterapeutas"
        },
        training_physio_report: {
            en: "Physio Report",
            br: "Relatório de lesões"
        },

        search__players: {
            en: "Players",
            br: "Jogadores"
        },
        search_clubs: {
            en: "Clubs",
            br: "Clubes"
        },
        search_national: {
            en: "National",
            br: "Seleções"
        },
        search_coaches: {
            en: "Coaches",
            br: "Treinadores"
        },
        search_physios: {
            en: "Physios",
            br: "Fisioterapeutas"
        },
        search_transfers: {
            en: "transfers",
            br: "Transferências"
        },

        community_forum: {
            en: "Forum",
            br: "Fórum"
        },
        community_rules: {
            en: "Rules",
            br: "Regras"
        },
        community_profile: {
            en: "Profile",
            br: "Perfil"
        },
        community_links: {
            en: "Links",
            br: "Links"
        },
    };
    let language = getLanguage();
    if (language!="en" && language!="br") language = "en";
    let i = 1;
    $('.menu_button:nth-child(' + i + ')').append((`<div class="dropdown-content"><a href="https://www.dugout-online.com/home/none/">${translation.home_home[language]}</a> <a href="https://www.dugout-online.com/news/none/">${translation.home_news[language]}</a> <a href="https://www.dugout-online.com/rules/none/">${translation.home_rules[language]}</a> <a href="https://www.dugout-online.com/helpmain/none/">${translation.home_help[language]}</a></div>`));
    i++;
    $('.menu_button:nth-child(' + i + ')').append((`<div class="dropdown-content"><a href="https://www.dugout-online.com/clubinfo/none/">${translation.club_info[language]}</a><a href="https://www.dugout-online.com/clubinfo/bids/">${translation.club_bids[language]}</a><a href="https://www.dugout-online.com/clubinfo/transfers/">${translation.club_transfers[language]}</a><a href="https://www.dugout-online.com/players/none/">${translation.club_players[language]}</a><a href="https://www.dugout-online.com/players/none/view/youth/">${translation.club_players_youth[language]}</a><a href="https://www.dugout-online.com/staff/none/">${translation.club_staff[language]}</a><a href="https://www.dugout-online.com/settings/none/">${translation.club_settings[language]}</a></div>`));
    i++;
    if ($(".menu_button").length > 7) {
        $('.menu_button:nth-child(' + i + ')').append((`<div class="dropdown-content"><a href="https://www.dugout-online.com/players_nt/none/">${translation.players_nt[language]}</a><a href="https://www.dugout-online.com/tactics_nt/none/">${translation.tactics_nt[language]}</a></div>`));
        i++;
    }
    $('.menu_button:nth-child(' + i + ')').append((`<div class="dropdown-content"><a href="https://www.dugout-online.com/finances/none/">${translation.management_finances[language]}</a> <a href="https://www.dugout-online.com/stadium/none/">${translation.management_stadium[language]}</a> <a href="https://www.dugout-online.com/facilities/none/">${translation.management_facilities[language]}</a> <a href="https://www.dugout-online.com/sponsors/none/">${translation.management_sponsors[language]}</a> <a href="https://www.dugout-online.com/calendar/none/">${translation.management_calendar[language]}</a></div>`));
    i++;
    $('.menu_button:nth-child(' + i + ')').append((`<div class="dropdown-content"><a href="https://www.dugout-online.com/tactics/none/">${translation.tactics_fiest[language]}</a> <a href="https://www.dugout-online.com/tactics_youth/none/">${translation.tactics_youth[language]}</a></div>`));
    i++;
    $('.menu_button:nth-child(' + i + ')').append((`<div class="dropdown-content"><a href="https://www.dugout-online.com/training/none/">${translation.training_training[language]}</a> <a href="https://www.dugout-online.com/physios/none/">${translation.training_physios[language]}</a> <a href="https://www.dugout-online.com/physio_report/none">${translation.training_physio_report[language]}</a></div>`));
    i++;
    $('.menu_button:nth-child(' + i + ')').append((`<div class="dropdown-content"><a href="https://www.dugout-online.com/search_players/none/">${translation.search__players[language]}</a> <a href="https://www.dugout-online.com/search_clubs/none/">${translation.search_clubs[language]}</a> <a href="https://www.dugout-online.com/national_teams/none/">${translation.search_national[language]}</a> <a href="https://www.dugout-online.com/search_coaches/none/">${translation.search_coaches[language]}</a> <a href="https://www.dugout-online.com/search_physios/none/">${translation.search_physios[language]}</a> <a href="https://www.dugout-online.com/search_transfers/none/">${translation.search_transfers[language]}</a></div>`));
    i++;
    $('.menu_button:nth-child(' + i + ')').append((`<div class="dropdown-content"><a href="https://www.dugout-online.com/forum/none/">${translation.community_forum[language]}</a> <a href="https://www.dugout-online.com/community_rules/none/">${translation.community_rules[language]}</a> <a href="https://www.dugout-online.com/community_profile/none/">${translation.community_profile[language]}</a> <a href="https://www.dugout-online.com/links/none/">${translation.community_links[language]}</a></div>`));

    // substitui divs do canto superior esquerdo por anchors para facilitar navegação
    [...document.querySelectorAll('div#top_container > div')]
        .filter(d => d.classList.contains(`${d.id}_ico`))
        .forEach(d => {
        const anchor = document.createElement('a');
        anchor.href = d.onclick.toString().split('document.location.href=')[1].split('\'')[1];
        anchor.classList.add(...d.classList.values())
        anchor.id = d.id;
        anchor.style.cssText = d.style.cssText;
        anchor.title = d.title;
        d.parentElement.insertBefore(anchor, d);
        d.remove();
    });
}

function pageTitle() {
    var title = $(location).attr('pathname').split("/")[1];
    title = title.charAt(0).toUpperCase() + title.slice(1);
    $(document).prop('title', title.replace("_", " "));
}

function coachesWage() {
    var max = 0;
    var wage = 0;
    $(".search_tbl tbody tr").first().append('<td width="36" class="table_header" valign="middle" align="center" style="cursor: default;" title="Approximate Wage">Wage</td>');
    $(".search_tbl tbody tr").each(function() {
        var data = Array();
        var count = 0;
        $(this).children('td').each(function() {
            if ($.isNumeric($(this).text())) {
                data.push(parseInt($(this).text()));
            } else {
                count++;
            }
        });
        if (data.length > 0) {
            data.shift();
            data.pop();
            data.pop();
            data.pop();
            data.pop();
            data.pop();

            max = Math.max.apply(Math, data);
            if (max <= 42) {
                wage = (24.44889 * max - 138.145) * max;
            } else {
                wage = (51.54712 * max - 1260) * max;
            }
            wage = parseFloat(wage, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();

            $(this).last().append('<td align="center"><span class="tableText">' + wage + '</span></td>');
        }
    });

    $('.search_tbl th:first').wrapInner('<div />').find('div').unwrap().wrap('<th/>');
    var header = $(".search_tbl tr:first").clone();
    $(".search_tbl tr:first").remove();
    $(".search_tbl tbody:first").before('<thead></thead>');
    $(".search_tbl thead:first").append(header);
    $(".search_tbl").dataTable({
        "searching": false,
        "bPaginate": false,
        "bLengthChange": false,
        "bFilter": true,
        "bInfo": false,
        "bAutoWidth": false,
        "order": [[ 13, 'asc' ]]
    });
}

function readResume() {
    let url = $(".maninfo a").attr('href');
    let pos = url.indexOf('toid');
    let toid = url.substring(pos+5);
    url = "https://www.dugout-online.com/readresume.php?id=" + toid;
    $(".clubname").append( "<a href=" + url + "> [Read Resume]</a>" );
}

function scoutButton() {
    let clubid = 1000;
    let sPageURL = $("a[href^='https://www.dugout-online.com/clubinfo/none/clubid/']")[1].href,
        sURLVariables = sPageURL.split('/'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === 'clubid') {
            clubid = sURLVariables[i+1];
        }
    }
    i = $('table tbody tr').length - 18;

    $('table > tbody  > tr').each(function(index, tr) {
        if (index == i) {
            $(this).append( '<td valign="middle" style="padding-left: 25px; padding-right: 1px;"><input type="button" value="Relatório do espião" style="" onclick="document.location.href=\'https://www.dugout-online.com/clubinfo/analysis/clubid/' + clubid + '\'"></td>' );
        }
    });
}

function loadTactics() {
    $('#field_cont table').append('<tr><td valign="middle" style="color: unset;" colspan="2"><textarea id="dataTtc" name="dataTtc" rows="2" cols="40"></textarea></td><td valign="middle" style="color: unset;"><input type="button" value="Apply" id="apply"><input type="button" value="getTtc" id="getTtc"></td></tr>');

    $("#getTtc").click(function() {
        data="action=submit&players_ids="+players[0]+"&positions="+players[1]+"&players_x="+players[2]+"&players_y="+players[3]+"&substitutes="+substitutes[0]+"&actions="+actionsb;
        data+="&options="+$("#agression_id").val()+"*"+$("#mentality_id option:selected").val()+"*"+$("#attack_wing_id option:selected").val();
        data+="*"+$("#passing_id option:selected").val()+"*"+$("#capitan_sel option:selected").val()+"*"+$("#playmaker_sel option:selected").val();
        data+="*"+$("#target_man_sel option:selected").val()+"*"+$("#penalty_sel option:selected").val();
        if($("#counter_attacks_id").prop('checked'))
            data+="*1";
        else
            data+="*0";
        if($("#offside_trap_id").prop('checked'))
            data+="*1";
        else
            data+="*0";

        $("#dataTtc").val(data);
    });

    $("#apply").click(function() {
        var xmlhttp;
        if (window.XMLHttpRequest)
            xmlhttp=new XMLHttpRequest();
        else
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        let url = '';
        if (page.match('/tactics/none/')) {
            url = SERVER_URL + "/ajaxphp/tactics_save.php";
        } else if (page.match('/tactics_youth/none/')) {
            url = SERVER_URL + "/ajaxphp/tactics_youth_save.php";
        } else if (page.match('/tactics_nt/none/')) {
            url = SERVER_URL + "/ajaxphp/tactics_nt_save.php";
        }
        xmlhttp.open("POST", url,true);
        xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.send($("#dataTtc").val());
        location.reload();
    });
}

function bidButton() {
    if ($('input[name="riseoffer"]').length == 1) {
        $('form[name="bidForm"]').addClass( "bidForm" );
        $( ".bidForm input:last" ).addClass( "bidButton" );

        let value = parseInt($('.bidForm input').val()) - 1000;
        let val1 = new Intl.NumberFormat('en-DE').format(value + 100000);
        let val2 = new Intl.NumberFormat('en-DE').format(value + 1000000);
        if (value < 2000000) {
            val2 = new Intl.NumberFormat('en-DE').format(parseInt(value + (value / 2)));
        }

        const translation = {
            bid: {
                en: "Bid",
                br: "Oferta"
            },
        }
        let language = getLanguage();
        if (language!="en" && language!="br") language = "en";
        $(`<input id="bid1" type="button" value="${translation.bid[language]} ${val1}"><input id="bid2" type="button" value="${translation.bid[language]} ${val2}"> "`).insertAfter( ".bidButton" );
        $("#bid1").click(function() {
            $('.bidForm input').val(val1);
            document.bidForm.submit();
        });
        $("#bid2").click(function() {
            $('.bidForm input').val(val2);
            document.bidForm.submit();
        });
    }
}

function playerImage() {
    const playerId = getUrlParameter('playerID');
    let playerInfo = JSON.parse(localStorage.getItem(`DOGenieAssistant.player.${playerId}`)) || { img: "" };
    const url = `https://sortitoutsi.b-cdn.net/uploads/face/${playerInfo.img}.png`;

    const playerImg = $(".tabbed_pane img").eq(1);
    playerImg.after(`
        <input id="imgId" type="text" value="${playerInfo.img}" style="position: absolute; left: 38px; top: 150px; width: 96px;">
        <button id="refresh" type="button" style="position: absolute; left: 10px; top: 150px;">
            <i class="fa fa-refresh"></i>
        </button>
    `);
    if (playerInfo.img) {
        replacePlayerImg(url);
    }

    $("#refresh").click(function() {
        const newImgValue = $("#imgId").val();
        playerInfo.img = (newImgValue !== "" && !isNaN(newImgValue)) ? parseInt(newImgValue) : "";
        replacePlayerImg(`https://sortitoutsi.b-cdn.net/uploads/face/${playerInfo.img}.png`);
        if (playerInfo.img){
            replacePlayerImg(`https://sortitoutsi.b-cdn.net/uploads/face/${playerInfo.img}.png`);
            localStorage.setItem(`DOGenieAssistant.player.${playerId}`, JSON.stringify(playerInfo));
        } else {
            replacePlayerImg("https://www.dugout-online.com/images/club/profile/player-pic-default.png");
            localStorage.removeItem(`DOGenieAssistant.player.${playerId}`);
        }
    });
}

function replacePlayerImg(url) {
    const playerImg = $(".tabbed_pane img").eq(1);
    playerImg.attr("src", url).css({ width: "150px", height: "150px" });
}

function teamLink() {
    let homeLink = $(`.generic_badge:first`).attr('onclick');
    if (!homeLink) {
        return;
    }
    homeLink = homeLink.substring(24);
    homeLink = homeLink.substring(0,homeLink.length -1);
    $(`.generic_badge:first`).before(`<a class="home_badge" style='cursor: pointer; float: left; position: relative; margin-left: 2px; margin-top: 5px; width: 120px; height: 120px;' href=${homeLink}>${ $(`.generic_badge:first`).html()}</a>`);
    $(`.generic_badge:first`).remove();
    $(`.home_badge`).addClass('generic_badge');

    let awayLink = $(`.generic_badge:last`).attr('onclick');
    awayLink = awayLink.substring(24);
    awayLink = awayLink.substring(0,awayLink.length -1);
    $(`.generic_badge:last`).before(`<a class="away_badge" style='cursor: pointer; float: left; position: relative; margin-left: 2px; margin-top: 5px; width: 120px; height: 120px;' href=${awayLink}>${ $(`.generic_badge:last`).html()}</a>`);
    $(`.generic_badge:last`).remove();
    $(`.away_badge`).addClass('generic_badge');
}

function getSponsors() {
    let lastSponsor = localStorage.getItem('DOGenieAssistant.lastSponsor') != null ? localStorage.getItem('DOGenieAssistant.lastSponsor') : '01/01/2000';
    let today = new Date(Date.now()).toLocaleString().split(',')[0];
    $(`#getSponsors`).css('visibility', 'visible');

    if (today == lastSponsor) {
        $(`#getSponsors`).css('font-style', 'italic');
        return;
    }
    sendSponsorsRequest();
}

function sendSponsorsRequest() {
    $.get( "https://www.dugout-online.com/sponsors/none/daily/1/slot/1/dailyID/1001", function( data ) {
        $( ".result" ).html( data );
    });
    $.get( "https://www.dugout-online.com/sponsors/none/daily/1/slot/2/dailyID/1001", function( data ) {
        $( ".result" ).html( data );
    });
    $.get( "https://www.dugout-online.com/sponsors/none/daily/1/slot/3/dailyID/1001", function( data ) {
        $( ".result" ).html( data );
    });
    $.get( "https://www.dugout-online.com/sponsors/adboards/daily/1/slot/1/dailyID/1002", function( data ) {
        $( ".result" ).html( data );
    });
    $.get( "https://www.dugout-online.com/sponsors/adboards/daily/1/slot/2/dailyID/1002", function( data ) {
        $( ".result" ).html( data );
    });
    $.get( "https://www.dugout-online.com/sponsors/adboards/daily/1/slot/3/dailyID/1002", function( data ) {
        $( ".result" ).html( data );
    });
    $.get( "https://www.dugout-online.com/sponsors/adboards/daily/1/slot/4/dailyID/1002", function( data ) {
        $( ".result" ).html( data );
    });
    $.get( "https://www.dugout-online.com/sponsors/adboards/daily/1/slot/5/dailyID/1002", function( data ) {
        $( ".result" ).html( data );
    });
    $.get( "https://www.dugout-online.com/sponsors/adboards/daily/1/slot/6/dailyID/1001", function( data ) {
        $( ".result" ).html( data );
    });

    let today = new Date(Date.now()).toLocaleString().split(',')[0];
    localStorage.setItem('DOGenieAssistant.lastSponsor', today);
}

$("#getSponsors").click(function(e) {
    sendSponsorsRequest();
    e.preventDefault();
});


function matchSound() {
    let gameId = getUrlParameter('gameid');
    let match = localStorage.getItem("DOGenieAssistant.match." + gameId) === null ? {} : localStorage.getItem("DOGenieAssistant.match." + gameId);

    if (Object.keys(match).length == 0){
        match['LAST_GOAL'] = null;
        match['LAST_OFFSIDE'] = null;
        match['GAME_ENDS'] = null;
    } else {
        match = JSON.parse(match);
    }

    for (var i = 0; i < 5; i++) {
        if (soundConfig["GOAL_SOUND"] !== "") {
            if ($("#events_content td:nth-child(1)").eq(i).html().indexOf('icon-goal') > 1) {
                let lastGoal = formatTime($("#events_content td:nth-child(2)").eq(i).html());
                if (formatTime(match['LAST_GOAL']) < lastGoal) {
                    match['LAST_GOAL'] = lastGoal;
                    localStorage.setItem('DOGenieAssistant.match.'  + gameId, JSON.stringify(match));
                    if ($("#events_content td:nth-child(3) a").eq(0).text() == $('.header_clubname').text()) {
                        $(`<iframe width="0%" height="0" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${soundConfig['HOME_GOAL_ID']}&amp;color=%23ff5500&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true&amp;visual=true"></iframe>`).insertAfter("#events_content");
                    } else {
                        $(`<iframe width="0%" height="0" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${soundConfig['AWAY_GOAL_ID']}&amp;color=%23ff5500&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true&amp;visual=true"></iframe>`).insertAfter("#events_content");
                    }
                    $("#events_content").delay(2000);
                    break;
                }
            }
        }

        if (soundConfig["OFFSIDE_SOUND"] !== "") {
            if ($("#events_content td:nth-child(1)").eq(i).html().indexOf('icon-offside') > 1) {
                let lastOffside = formatTime($("#events_content td:nth-child(2)").eq(i).html());
                if (formatTime(match['LAST_OFFSIDE']) < lastOffside) {
                    match['LAST_OFFSIDE'] = lastOffside;
                    localStorage.setItem('DOGenieAssistant.match.'  + gameId, JSON.stringify(match));
                    $(`<iframe width="0%" height="0" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${soundConfig['OFFSIDE_SOUND']}&amp;color=%23ff5500&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true&amp;visual=true"></iframe>`).insertAfter("#events_content");
                    $("#events_content").delay(2000);
                    break;
                }
            }
        }
    }
    if (soundConfig["GAME_END_SOUND"] !== "") {
        if ($("#events_content td:nth-child(3)").eq(0).html().substring(0,9) == 'Game ends') {
            let gameEnds = formatTime($("#events_content td:nth-child(2)").eq(0).html());
            if (formatTime(match['GAME_ENDS']) != gameEnds) {
                match['GAME_ENDS'] = gameEnds;
                localStorage.setItem('DOGenieAssistant.match.'  + gameId, JSON.stringify(match));
                $(`<iframe width="0%" height="0" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${soundConfig['GAME_END_ID']}&amp;color=%23ff5500&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true&amp;visual=true"></iframe>`).insertAfter("#events_content");
                $("#events_content").delay(2000);
            }
        }
    }
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.href,
        sURLVariables = sPageURL.split('/'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i];

        if (sParameterName === sParam) {
            return sURLVariables[i+1] === undefined ? true : decodeURIComponent(sURLVariables[i+1]);
        }
    }
    return false;
};

function formatTime(str) {
    if (str === null) {
        str = "00,00";
    }
    str = str.replace('[', '');
    str = str.replace(']', '');
    str = str.replace(':', ',');
    str = str.replace(' ', '');
    return str.replace( /(<([^>]+)>)/ig, '');
}

function configMenu() {
    let secondaryClock = typeof configs["SECONDARY_CLOCK"] !== 'undefined' || configs["SECONDARY_CLOCK"] === null ? configs["SECONDARY_CLOCK"] : 'checked';
    let dropdownMenu = typeof configs["DROPDDOWN_MENU"] !== 'undefined' || configs["DROPDDOWN_MENU"] === null ? configs["DROPDDOWN_MENU"] : 'checked';
    let pageTitle = typeof configs["PAGE_TITLE"] !== 'undefined' || configs["PAGE_TITLE"] === null ? configs["PAGE_TITLE"] : 'checked';
    let readResume = typeof configs["READ_RESUME"] !== 'undefined' || configs["READ_RESUME"] === null ? configs["READ_RESUME"] : 'checked';
    let playerOPSName = typeof configs["PLAYER_OPS_NAME"] !== 'undefined' || configs["PLAYER_OPS_NAME"] === null ? configs["PLAYER_OPS_NAME"] : 'checked';
    let playerOPSId = typeof configs["PLAYER_OPS_ID"] !== 'undefined' || configs["PLAYER_OPS_ID"] === null ? configs["PLAYER_OPS_ID"] : 'checked';
    let playerExp = typeof configs["PLAYER_EXP"] !== 'undefined' || configs["PLAYER_EXP"] === null ? configs["PLAYER_EXP"] : 'checked';
    let squadDetails = typeof configs["SQUAD_DETAILS"] !== 'undefined' || configs["SQUAD_DETAILS"] === null ? configs["SQUAD_DETAILS"] : 'checked';
    let squadFilters = typeof configs["SQUAD_FILTERS"] !== 'undefined' || configs["SQUAD_FILTERS"] === null ? configs["SQUAD_FILTERS"] : 'checked';
    let squadHigh = typeof configs["SQUAD_HIGH"] !== 'undefined' || configs["SQUAD_HIGH"] === null ? configs["SQUAD_HIGH"] : 'checked';
    let loadTactics = typeof configs["LOAD_TACTICS"] !== 'undefined' || configs["LOAD_TACTICS"] === null ? configs["LOAD_TACTICS"] : 'checked';
    let tacticsDetails = typeof configs["TACTICS_DETAILS"] !== 'undefined' || configs["TACTICS_DETAILS"] === null ? configs["TACTICS_DETAILS"] : 'checked';
    let coachesWage = typeof configs["COACHES_WAGE"] !== 'undefined' || configs["COACHES_WAGE"] === null ? configs["COACHES_WAGE"] : 'checked';
    let scoutButton = typeof configs["SCOUT_BUTTON"] !== 'undefined' || configs["SCOUT_BUTTON"] === null ? configs["SCOUT_BUTTON"] : 'checked';
    let spreadsheetSquad = typeof configs["SPREADSHEET_SQUAD"] !== 'undefined' || configs["SPREADSHEET_SQUAD"] === null ? configs["SPREADSHEET_SQUAD"] : 'checked';
    let bidButton = typeof configs["BID_BUTTON"] !== 'undefined' || configs["BID_BUTTON"] === null ? configs["BID_BUTTON"] : 'checked';
    let teamLink = typeof configs["TEAM_LINK"] !== 'undefined' || configs["TEAM_LINK"] === null ? configs["TEAM_LINK"] : 'checked';
    let getSponsors = typeof configs["GET_SPONSORS"] !== 'undefined' || configs["GET_SPONSORS"] === null ? configs["GET_SPONSORS"] : 'checked';
    let playerImage = typeof configs["PLAYER_IMAGE"] !== 'undefined' || configs["PLAYER_IMAGE"] === null ? configs["PLAYER_IMAGE"] : 'checked';

    $(`<div class="gui_object" style="width: 468px; margin-left: 8px;">
    <div class="window1_wrapper" style="margin-top: 4px; width: 490px;">
        <div class="window1_header_start"></div>
        <div class="window1_header" style="width: 480px;">
            <div class="window1_header_text">&nbsp;DO Genie Assistant Configs</div>
            <a href="https://github.com/edunogueira/DOGenieAssistant/raw/main/DOGenieAssistant.user.js/" target="_blank" style="margin-left: 10px;">
                <button>Update extension</button>
            </a>
        </div>
        <div class="window1_header_end"></div>
    </div>
    <div class="window1_wrapper" style="margin-top: 0px; width: 468px;">
        <div class="window1_content" style="width: 486px;">
            <form name="configForm" action="#" method="post" class="configForm">
               <table width="99%" border="0" cellspacing="1" cellpadding="1" class="matches_tbl" style="margin-bottom: 0px; margin-left: 3px; margin-top: 2px;">
                   <tbody>
                       <tr class="table_top_row">
                           <td valign="middle" align="left" style="font-weight: bold; font-size: 12px;">
                               Secondary Clock: <input type="checkbox" name="SECONDARY_CLOCK" ${secondaryClock}>
                               Dropdown Menu: <input type="checkbox" name="DROPDDOWN_MENU" ${dropdownMenu}>
                               Page Title: <input type="checkbox" name="PAGE_TITLE" ${pageTitle}>
                           </td>
                       </tr>
                       <tr class="table_top_row">
                           <td valign="middle" align="left" style="font-weight: bold; font-size: 12px;">
                               Team Link: <input type="checkbox" name="TEAM_LINK" ${teamLink}>
                               Get Sponsors: <input type="checkbox" name="GET_SPONSORS" ${getSponsors}>
                           </td>
                       </tr>
                       <tr class="table_top_row">
                           <td valign="middle" align="left" style="font-weight: bold; font-size: 12px;">
                               Coaches Wage: <input type="checkbox" name="COACHES_WAGE" ${coachesWage}>
                               Read Resume: <input type="checkbox" name="READ_RESUME" ${readResume}>
                               Scout Button: <input type="checkbox" name="SCOUT_BUTTON" ${scoutButton}>
                           </td>
                       </tr>
                       <tr class="table_top_row">
                           <td valign="middle" align="left" style="font-weight: bold; font-size: 12px;">
                               Squad Details: <input type="checkbox" name="SQUAD_DETAILS" ${squadDetails}>
                               Squad Filters: <input type="checkbox" name="SQUAD_FILTERS" ${squadFilters}>
                               Squad High: <input type="checkbox" name="SQUAD_HIGH" ${squadHigh}>
                               Sreadsheet Squad: <input type="checkbox" name="SPREADSHEET_SQUAD" ${spreadsheetSquad}>
                           </td>
                       </tr>
                       <tr class="table_top_row">
                           <td valign="middle" align="left" style="font-weight: bold; font-size: 12px;">
                               Player OPS on Name: <input type="checkbox" name="PLAYER_OPS_NAME" ${playerOPSName}>
                               Player OPS on Id: <input type="checkbox" name="PLAYER_OPS_ID" ${playerOPSId}>
                               Player EXP: <input type="checkbox" name="PLAYER_EXP" ${playerExp}>
                               Player Image: <input type="checkbox" name="PLAYER_IMAGE" ${playerImage}>
                           </td>
                       </tr>
                       <tr class="table_top_row">
                           <td valign="middle" align="left" style="font-weight: bold; font-size: 12px;">
                               Load Tactics: <input type="checkbox" name="LOAD_TACTICS" ${loadTactics}>
                               Tatics Details: <input type="checkbox" name="TACTICS_DETAILS" ${tacticsDetails}>
                               Bid Button: <input type="checkbox" name="BID_BUTTON" ${bidButton}>
                           </td>
                       </tr>
                    </tbody>
                </table>
                <input id="saveConfig" type="submit" style="width: 140px;margin-top: 20px;" value="Save">
                <input id="getSponsors" type="submit" style="width: 140px;margin-top: 20px;visibility: hidden;" value="Get Sponsors">
                <input id="clearStorage" type="submit" style="width: 140px;margin-top: 20px;" value="Clear Config Storage">
                <input id="clearPlayerImages" type="submit" style="width: 140px;margin-top: 20px;" value="Clear Player Images">
        <div class="window1_bottom" style="width: 482px;"></div>
        <div class="window1_bottom_end"></div>
    </div>
</div>`).insertAfter( "#footer" );
    $("#saveConfig").click(function() {
        configs['SECONDARY_CLOCK'] = $('input[name="SECONDARY_CLOCK"]').is(":checked") ? "checked" : "";
        configs['DROPDDOWN_MENU'] = $('input[name="DROPDDOWN_MENU"]').is(":checked") ? "checked" : "";
        configs['PAGE_TITLE'] = $('input[name="PAGE_TITLE"]').is(":checked") ? "checked" : "";
        configs['READ_RESUME'] = $('input[name="READ_RESUME"]').is(":checked") ? "checked" : "";
        configs['PLAYER_OPS_NAME'] = $('input[name="PLAYER_OPS_NAME"]').is(":checked") ? "checked" : "";
        configs['PLAYER_OPS_ID'] = $('input[name="PLAYER_OPS_ID"]').is(":checked") ? "checked" : "";
        configs['PLAYER_EXP'] = $('input[name="PLAYER_EXP"]').is(":checked") ? "checked" : "";
        configs['SQUAD_DETAILS'] = $('input[name="SQUAD_DETAILS"]').is(":checked") ? "checked" : "";
        configs['SQUAD_FILTERS'] = $('input[name="SQUAD_FILTERS"]').is(":checked") ? "checked" : "";
        configs['SQUAD_HIGH'] = $('input[name="SQUAD_HIGH"]').is(":checked") ? "checked" : "";
        configs['LOAD_TACTICS'] = $('input[name="LOAD_TACTICS"]').is(":checked") ? "checked" : "";
        configs['TACTICS_DETAILS'] = $('input[name="TACTICS_DETAILS"]').is(":checked") ? "checked" : "";
        configs['COACHES_WAGE'] = $('input[name="COACHES_WAGE"]').is(":checked") ? "checked" : "";
        configs['SCOUT_BUTTON'] = $('input[name="SCOUT_BUTTON"]').is(":checked") ? "checked" : "";
        configs['SPREADSHEET_SQUAD'] = $('input[name="SPREADSHEET_SQUAD"]').is(":checked") ? "checked" : "";
        configs['BID_BUTTON'] = $('input[name="BID_BUTTON"]').is(":checked") ? "checked" : "";
        configs['TEAM_LINK'] = $('input[name="TEAM_LINK"]').is(":checked") ? "checked" : "";
        configs['GET_SPONSORS'] = $('input[name="GET_SPONSORS"]').is(":checked") ? "checked" : "";
        configs['PLAYER_IMAGE'] = $('input[name="PLAYER_IMAGE"]').is(":checked") ? "checked" : "";
        localStorage.setItem('DOGenieAssistant.configs', JSON.stringify(configs));
    });
}

function clearStorage() {
    $("#clearStorage").click(function(e) {
        localStorage.removeItem("PAGE_TITLE");
        localStorage.removeItem("TACTICS_DETAILS");
        localStorage.removeItem("LAST_GOAL");
        localStorage.removeItem("SECONDARY_CLOCK");
        localStorage.removeItem("GET_SPONSORS");
        localStorage.removeItem("TRACK_ID");
        localStorage.removeItem("TEAM_LINK");
        localStorage.removeItem("LOAD_TACTICS");
        localStorage.removeItem("BID_BUTTON");
        localStorage.removeItem("PLAYER_EXP");
        localStorage.removeItem("COACHES_WAGE");
        localStorage.removeItem("PLAYER_OPS");
        localStorage.removeItem("PLAYER_OPS_ID");
        localStorage.removeItem("SQUAD_DETAILS");
        localStorage.removeItem("SQUAD_FILTERS");
        localStorage.removeItem("PLAYER_OPS_NAME");
        localStorage.removeItem("SQUAD_HIGH");
        localStorage.removeItem("READ_RESUME");
        localStorage.removeItem("GOAL_SOUND");
        localStorage.removeItem("SPREADSHEET_SQUAD");
        localStorage.removeItem("SCOUT_BUTTON");
        localStorage.removeItem("DROPDDOWN_MENU");
        localStorage.removeItem("PLAYER_IMAGE");
        localStorage.removeItem("DOGenieAssistant.configs");
        e.preventDefault();
    });
}

function getStorage(storageConfigs) {
    if ((storageConfigs == null) || (storageConfigs == '[]')){
        configs['SECONDARY_CLOCK'] = 'checked';
        configs['DROPDDOWN_MENU'] = 'checked';
        configs['PAGE_TITLE'] = 'checked';
        configs['READ_RESUME'] = 'checked';
        configs['PLAYER_OPS_NAME'] = 'checked';
        configs['PLAYER_OPS_ID'] = 'checked';
        configs['PLAYER_EXP'] = 'checked';
        configs['SQUAD_DETAILS'] = 'checked';
        configs['SQUAD_FILTERS'] = 'checked';
        configs['SQUAD_HIGH'] = 'checked';
        configs['LOAD_TACTICS'] = 'checked';
        configs['TACTICS_DETAILS'] = 'checked';
        configs['COACHES_WAGE'] = 'checked';
        configs['SCOUT_BUTTON'] = 'checked';
        configs['SPREADSHEET_SQUAD'] = 'checked';
        configs['BID_BUTTON'] = 'checked';
        configs['TEAM_LINK'] = 'checked';
        configs['GET_SPONSORS'] = 'checked';
        configs['PLAYER_IMAGE'] = 'checked';
        localStorage.setItem('DOGenieAssistant.configs', JSON.stringify(configs));
    } else {
        configs = JSON.parse(storageConfigs);
    }
    return configs;
}

function configSound() {
    let matchSound = soundConfig["MATCH_SOUND"] === null ? 'checked' : soundConfig["MATCH_SOUND"];
    let goalSound = soundConfig["GOAL_SOUND"] === null ? 'checked' : soundConfig["GOAL_SOUND"];
    let goalId = soundConfig["HOME_GOAL_ID"] === null ? '1579437467' : soundConfig["HOME_GOAL_ID"];
    let awayGoalId = soundConfig["AWAY_GOAL_ID"] === null ? '1636248327' : soundConfig["AWAY_GOAL_ID"];
    let offsideSound = soundConfig["OFFSIDE_SOUND"] === null ? 'checked' : soundConfig["OFFSIDE_SOUND"];
    let offsideId = soundConfig["OFFSIDE_ID"] === null ? '1636263519' : soundConfig["OFFSIDE_ID"];
    let gameEndSound = soundConfig["GAME_END_SOUND"] === null ? 'checked' : soundConfig["GAME_END_SOUND"];
    let gameEndId = soundConfig["GAME_END_ID"] === null ? '1636248255' : soundConfig["GAME_END_ID"];

    $(`<div class="gui_object" style="width: 468px; margin-left: 8px;">
    <div class="window1_wrapper" style="margin-top: 4px; width: 468px;">
        <div class="window1_header_start"></div>
        <div class="window1_header" style="width: 460px;">
            <div class="window1_header_text">&nbsp;DO Genie Assistant Sound Configs</div>
        </div>
        <div class="window1_header_end"></div>
    </div>
    <div class="window1_wrapper" style="margin-top: 0px; width: 468px;">
        <div class="window1_content" style="width: 466px;">
            <form name="configForm" action="#" method="post" class="configForm">
               <table width="99%" border="0" cellspacing="1" cellpadding="1" class="matches_tbl" style="margin-bottom: 0px; margin-left: 3px; margin-top: 2px;">
                   <tbody>
                       <tr class="table_top_row">
                           <td valign="middle" align="left" style="font-weight: bold; font-size: 12px;">
                               Match Sounds: <input type="checkbox" name="MATCH_SOUND" ${matchSound}>
                           </td>
                       </tr>
                       <tr class="table_top_row">
                           <td valign="middle" align="left" style="font-weight: bold; font-size: 12px;">
                               Goal Sound: <input type="checkbox" name="GOAL_SOUND" ${goalSound}>
                               <br>Home Goal Sound Id: <input type="text" name="HOME_GOAL_ID" value='${goalId}'>
                               <br>Away Goal Sound Id: <input type="text" name="AWAY_GOAL_ID" value='${awayGoalId}'>
                           </td>
                       </tr>
                       <tr class="table_top_row">
                           <td valign="middle" align="left" style="font-weight: bold; font-size: 12px;">
                               Offside Sound: <input type="checkbox" name="OFFSIDE_SOUND" ${offsideSound}>
                               Offside Sound Id: <input type="text" name="OFFSIDE_ID" value='${offsideId}'>
                           </td>
                       </tr>
                       <tr class="table_top_row">
                           <td valign="middle" align="left" style="font-weight: bold; font-size: 12px;">
                               Game End Sound: <input type="checkbox" name="GAME_END_SOUND" ${gameEndSound}>
                               Game End Sound Id: <input type="text" name="GAME_END_ID" value='${gameEndId}'>
                           </td>
                       </tr>
                    </tbody>
                </table>
                <input id="saveSoundConfig" type="submit" style="width: 140px;margin-top: 20px;" value="Save">
                <input id="clearMatchStorage" type="submit" style="width: 140px;margin-top: 20px;" value="Clear Match Storage">
        <div class="window1_bottom_start"></div>
        <div class="window1_bottom" style="width: 460px;"></div>
        <div class="window1_bottom_end"></div>
    </div>
</div>`).insertAfter( "#footer" );
    $("#saveSoundConfig").click(function() {
        soundConfig['MATCH_SOUND'] = $('input[name="MATCH_SOUND"]').is(":checked") ? "checked" : "";
        soundConfig['GOAL_SOUND'] = $('input[name="GOAL_SOUND"]').is(":checked") ? "checked" : "";
        soundConfig['HOME_GOAL_ID'] = $('input[name="HOME_GOAL_ID"]')[0].value ? $('input[name="HOME_GOAL_ID"]')[0].value : "1579437467";
        soundConfig['AWAY_GOAL_ID'] = $('input[name="AWAY_GOAL_ID"]')[0].value ? $('input[name="AWAY_GOAL_ID"]')[0].value : "1636248327";
        soundConfig['OFFSIDE_SOUND'] = $('input[name="OFFSIDE_SOUND"]').is(":checked") ? "checked" : "";
        soundConfig['OFFSIDE_ID'] = $('input[name="OFFSIDE_ID"]')[0].value ? $('input[name="OFFSIDE_ID"]')[0].value : "1636263519";
        soundConfig['GAME_END_SOUND'] = $('input[name="GAME_END_SOUND"]').is(":checked") ? "checked" : "";
        soundConfig['GAME_END_ID'] = $('input[name="GAME_END_ID"]')[0].value ? $('input[name="GAME_END_ID"]')[0].value : "1636248255";

        localStorage.setItem('DOGenieAssistant.soundConfig', JSON.stringify(soundConfig));
    });
}

function clearMatchStorage() {
     $("#clearMatchStorage").click(function(e) {
        let arr = [];
        let i =0
        for (i = 0; i < localStorage.length; i++){
            if (localStorage.key(i).substring(0,22) == 'DOGenieAssistant.match') {
                arr.push(localStorage.key(i));
            }
        }
        for (i = 0; i < arr.length; i++) {
            localStorage.removeItem(arr[i]);
        }
        e.preventDefault();
    });
}

function getSoundStorage(storageConfigs) {
    if ((storageConfigs == null) || (storageConfigs == '[]')){
        soundConfig['MATCH_SOUND'] = 'checked';
        soundConfig['GOAL_SOUND'] = 'checked';
        soundConfig['HOME_GOAL_ID'] = '1579437467';
        soundConfig['AWAY_GOAL_ID'] = '1636248327';
        soundConfig['OFFSIDE_SOUND'] = 'checked';
        soundConfig['OFFSIDE_ID'] = '1636263519';
        soundConfig['GAME_END_SOUND'] = 'checked';
        soundConfig['GAME_END_ID'] = '1636248255';
        localStorage.setItem('DOGenieAssistant.soundConfig', JSON.stringify(soundConfig));
    } else {
       soundConfig = JSON.parse(storageConfigs);
    }
    return soundConfig;
}

function clearPlayerImages() {
     $("#clearPlayerImages").click(function(e) {
        let arr = [];
        let i =0
        for (i = 0; i < localStorage.length; i++){
            if (localStorage.key(i).substring(0,23) == 'DOGenieAssistant.player') {
                arr.push(localStorage.key(i));
            }
        }
        for (i = 0; i < arr.length; i++) {
            localStorage.removeItem(arr[i]);
        }
        e.preventDefault();
    });
}
