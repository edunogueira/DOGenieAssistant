// ==UserScript==
// @name         DO Genie Assistant
// @version      18.1
// @namespace    https://github.com/edunogueira/DOGenieAssistant/
// @description  dugout-online genie assistant
// @author       Eduardo Nogueira de Oliveira
// @icon         https://www.google.com/s2/favicons?domain=dugout-online.com
// @require	 http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require      https://cdn.datatables.net/1.11.3/js/jquery.dataTables.min.js
// @include      http*dugout-online.com/*
// @include      https://www.dugout-online.com/*
// ==/UserScript==
//page select ----------------------------------------------//
var page = document.URL;

const SECONDARY_CLOCK = 0;
const DROPDWON_MENU = 1;
const PAGE_TITLE = 1;
const PLAYER_OPS = 1;
const PLAYER_EXP = 1;
const SQUAD_DETAILS = 1;
const TACTICS_DETAILS = 1;
const SQUAD_HIGH = 1;
const COACHES_WAGE = 1;
const READ_RESUME = 1;
const LOAD_TACTICS = 1;
const SCOUT_BUTTON = 1;

pageTitle();

if (page.match('/players/details/')) {
    playerDetails();
} else if (page.match('/players/none/') || page.match('/players_nt/none/')) {
    if (SQUAD_DETAILS) {
        squadDetails();
    }
} else if (page.match('/tactics/none/') || page.match('/tactics_youth/none/') || page.match('/tactics_nt/none/')) {
    if (TACTICS_DETAILS) {
        tacticsDetails();
    }
    if (LOAD_TACTICS) {
        loadTactics();
    }
} else if (page.match('/search_coaches/none/')) {
    if (COACHES_WAGE) {
        coachesWage();
    }
} else if (page.match('/clubinfo/none/clubid/')) {
    if (READ_RESUME) {
        readResume();
    }
} else if (page.match('/clubinfo/none/')) {
    if (SCOUT_BUTTON) {
        scoutButton();
    }
}


dropdownMenu();
secondaryClock();

//helper //----------------------------------------------//
function serverTime() {
    const d = new Date();
    let h = addZero(d.getHours());
    let m = addZero(d.getMinutes());
    let s = addZero(d.getSeconds());
    let time = h + ":" + m + ":" + s;
    $('#servertime2').text(time);
}

function addZero(i) {
    if (i < 10) {
        i = "0" + i
    }

    return i;
}

function applyStyle(css) {
    'use strict';
    var head,
        style;
    head = document.getElementsByTagName('head')[0];

    if (!head) {
        return;
    }

    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

function getExp(string1) {
    var retval = string1.substring(0, string1.indexOf(" XP\""));
    retval = retval.substring(retval.lastIndexOf("\"") + "\"".length);
    retval = parseInt(retval);
    return retval;
}

function getPos() {
    var posArray = new Array();
    // Prepopulate with zero values, because threre are no div elements with /positions-0.png:
    posArray[0] = "0"; // GK  (always 0 or 1 and never 2 or 3)
    posArray[1] = "0"; // DL
    posArray[2] = "0"; // DC
    posArray[3] = "0"; // DR
    posArray[4] = "0"; // ML
    posArray[5] = "0"; // MC
    posArray[6] = "0"; // MR
    posArray[7] = "0"; // FL
    posArray[8] = "0"; // FC
    posArray[9] = "0"; // FR
    // Find the correct main div element with all the positions:
    var imgs = document.getElementsByTagName("img");
    var mainDiv,
        i,
        img;

    for (i in imgs) {
        img = imgs[i];

        if (img != undefined && img.src.indexOf("positions-field") > 0) {
            mainDiv = img.parentNode;
            break;
        }
    }

    // Go thru all div elements (positions):
    var posDivs = mainDiv.getElementsByTagName("div");

    for (i in posDivs) {
        var posDiv = posDivs[i];

        if (posDiv.style != undefined) {
            // Get position number:
            img = posDiv.style.background;
            var num = img.substring(img.indexOf("positions-") + "positions-".length, img.indexOf(".png"));
            var t = posDiv.style.top;
            var l = posDiv.style.left;
            // Fill posArray with position numbers:
            if (t == "69px" && l == "10px") posArray[0] = num; // GK
            if (t == "69px" && l == "40px") posArray[2] = num; // DC
            if (t == "20px" && l == "40px") posArray[1] = num; // DL
            if (t == "117px" && l == "40px") posArray[3] = num; // DR
            if (t == "69px" && l == "108px") posArray[5] = num; // MC
            if (t == "20px" && l == "108px") posArray[4] = num; // ML
            if (t == "117px" && l == "108px") posArray[6] = num; // MR
            if (t == "69px" && l == "185px") posArray[8] = num; // FC
            if (t == "20px" && l == "185px") posArray[7] = num; // FL
            if (t == "117px" && l == "185px") posArray[9] = num; // FR
        }
    }

    // posArray now contains values from 0-3 (none, green, yellow, red)
    // posArray[0] = GK  (always 0 or 1 and never 2 or 3)
    // posArray[1] = DL
    // posArray[2] = DC
    // posArray[3] = DR
    // posArray[4] = ML
    // posArray[5] = MC
    // posArray[6] = MR
    // posArray[7] = FL
    // posArray[8] = FC
    // posArray[9] = FR
    return posArray;
}

function getOPS(data) {
    var ops = new Array();
    var bestPos, maxOPS = 0;

    ops[0] = (data[0] + data[5] + data[10] + data[15] + data[13]);
    ops[1] = (data[16] + data[6] + data[1] + data[15] + data[13]);
    ops[2] = (data[6] + data[11] + data[1] + data[15] + data[13]);
    ops[3] = (data[16] + data[6] + data[1] + data[15] + data[13]);
    ops[4] = (data[16] + data[17] + data[7] + data[2] + data[13]);
    ops[5] = (data[12] + data[17] + data[7] + data[2] + data[13]);
    ops[6] = (data[16] + data[17] + data[7] + data[2] + data[13]);
    ops[7] = (data[3] + data[8] + data[17] + data[16] + data[13]);
    ops[8] = (data[3] + data[8] + data[17] + data[11] + data[13]);
    ops[9] = (data[3] + data[8] + data[17] + data[16] + data[13]);

    ops[10] = (data[1] + data[6] + data[7] + data[2] + data[13]);
    ops[11] = (data[12] + data[2] + data[7] + data[3] + data[8]);
    ops['pos'] = 0;

    for (var i = 0; i < ops.length; ++i) {
        if (isNaN(ops[i])) {
            ops[i] = 0;
        }
        if (ops[i] < maxOPS) continue;
        if (ops[i] > maxOPS) {
            maxOPS = ops[i];
            ops['pos'] = i;
        }
    }
    return ops;
}

function getCoachOPS(data) {
    var ops = new Array();
    var bestPos, maxOPS = 0;

    ops[0] = (data[0] + data[5] + data[10] + data[15] + data[13]);
    ops[1] = (data[16] + data[6] + data[1] + data[15] + data[13]);
    ops[2] = (data[6] + data[11] + data[1] + data[15] + data[13]);
    ops[3] = (data[16] + data[6] + data[1] + data[15] + data[13]);
    ops[4] = (data[16] + data[17] + data[7] + data[2] + data[13]);
    ops[5] = (data[12] + data[17] + data[7] + data[2] + data[13]);
    ops[6] = (data[16] + data[17] + data[7] + data[2] + data[13]);
    ops[7] = (data[3] + data[8] + data[17] + data[16] + data[13]);
    ops[8] = (data[3] + data[8] + data[17] + data[11] + data[13]);
    ops[9] = (data[3] + data[8] + data[17] + data[16] + data[13]);

    ops[10] = (data[1] + data[6] + data[7] + data[2] + data[13]);
    ops[11] = (data[12] + data[2] + data[7] + data[3] + data[8]);
    ops['pos'] = 0;

    for (var i = 0; i < ops.length; ++i) {
        if (isNaN(ops[i])) {
            ops[i] = 0;
        }
        if (ops[i] < maxOPS) continue;
        if (ops[i] > maxOPS) {
            maxOPS = ops[i];
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

    if (SQUAD_HIGH) {
        $(selector).dataTable({
            "searching": false,
            "bPaginate": false,
            "bLengthChange": false,
            "bFilter": true,
            "bInfo": false,
            "bAutoWidth": false,
            "order": [
                [$(selector + ' .table_top_row th').size() - 2, "desc"]
            ]
        });
    } else {
        $(selector).dataTable({
            "searching": false,
            "bPaginate": false,
            "bLengthChange": false,
            "bFilter": true,
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
    if (PLAYER_OPS) {
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

        if ((ops['pos'] != natPos)) {
            $('.player_name').append(' @ OPS ' + ops[natPos] + '/' + ops[ops['pos']] + '*');
        } else {
            $('.player_name').append(' @ OPS ' + ops[natPos]);
        }
    }
    if (PLAYER_EXP) {
        var exp = getExp((new XMLSerializer()).serializeToString(document));
        $('.player_name').append(' | ' + exp + ' XP');
    }
    $(document).prop('title', $('.player_name').text());
}

function squadDetails() {
    $(".forumline .table_top_row").each(function() {
        $(this).last().append('<td align="center" width="20" title="Original Position Skills" class="tableHeader">OPS</td>');
        if (SQUAD_HIGH) {
            $(this).last().append('<td align="center" width="20" title="Best Original Position Skills" class="tableHeader">HIGH</td>');
        }
    });

    $(".forumline [class*=matches_row]").each(function() {
        var data = Array();
        var count = 0;
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
            var position = $(this).find(" [class*=_icon]").text();
            var ops = getOPS(data);
            var natPos = 0;

            if (position == "GK") {
                natPos = 0;
            } else if ((position == "DL")) {
                natPos = 1;
            } else if (position == "DC") {
                natPos = 2;
            } else if (position == "DR") {
                natPos = 3;
            } else if (position == "ML") {
                natPos = 4;
            } else if (position == "MC") {
                natPos = 5;
            } else if (position == "MR") {
                natPos = 6;
            } else if (position == "FL") {
                natPos = 7;
            } else if (position == "FC") {
                natPos = 8;
            } else if (position == "FR") {
                natPos = 9;
            }
            $(this).last().append('<td align="center"><span class="tableText">' + ops[natPos] + '</span></td>');
            if (SQUAD_HIGH) {
                if (ops[ops['pos']] > ops[natPos]) {
                    $(this).last().append('<td align="center"><span class="tableText"><strong>' + ops[ops['pos']] + '</strong></span></td>');
                } else {
                    $(this).last().append('<td align="center"><span class="tableText">' + ops[ops['pos']] + '</span></td>');
                }
            }
        } else if (count > 1) {
            $(this).last().append('<td align="center"><span class="tableText">0</span></td>');
            if (SQUAD_HIGH) {
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
            $(this).css('text-decoration', 'underline');
            $(this).css('font-weight', 'bold');
        }

        $.each(subs, function(key, value) {
            if (value == playerId) {
                subdecoration = true;
                return false;
            }
        });
        if (subdecoration == true) {
            $(this).css('font-weight', 'bold');
            $(this).css('color', 'blue');
        }

        $(this).find("#" + playerId + " table tr").each(function() {
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
            var array = $(this).find(" [class*=matches_row] > td").map(function() {
                return $.trim($(this).text());
            }).get();
            var position = array[2];
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

            $(this).find("#" + playerId + " .ops").text(ops);
        }
    });
}

function secondaryClock() {
    if (SECONDARY_CLOCK) {
        $('#footer').append('<div class="time_display" id="servertime2" style="top: 12px;border:1px solid #fff"></div>');
        setInterval(serverTime, 1000);
    }
}

function dropdownMenu() {
    if (DROPDWON_MENU) {
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

        const getLanguage = () => {
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
}

function pageTitle() {
    if (PAGE_TITLE) {
        var title = $(location).attr('pathname').split("/")[1];
        title = title.charAt(0).toUpperCase() + title.slice(1);
        $(document).prop('title', title.replace("_", " "));
    }
}

function coachesWage() {
    if (COACHES_WAGE) {
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
}

function readResume() {
    if (READ_RESUME) {
        let url = $(".maninfo a").attr('href');
        let pos = url.indexOf('toid');
        let toid = url.substring(pos+5);
        url = "https://www.dugout-online.com/readresume.php?id=" + toid;
        $(".clubname").append( "<a href=" + url + "> [Read Resume]</a>" );
    }
}

function scoutButton() {
    if (SCOUT_BUTTON) {
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

        $('table > tbody  > tr').each(function(index, tr) {
            if (index == 8) {
                $(this).append( '<td valign="middle" style="padding-left: 25px; padding-right: 1px;"><input type="button" value="Relatório do espião" style="" onclick="document.location.href=\'https://www.dugout-online.com/clubinfo/analysis/clubid/' + clubid + '\'"></td>' );
            }

        });
    }
}

function loadTactics() {
    if (LOAD_TACTICS) {
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
}
