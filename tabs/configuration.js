'use strict';

TABS.configuration = {};

TABS.configuration.initialize = function (callback, scrollPosition) {
    var self = this;

    if (GUI.active_tab != 'configuration') {
        GUI.active_tab = 'configuration';
        googleAnalytics.sendAppView('Configuration');
    }

    function load_config() {
        MSP.send_message(MSP_codes.MSP_CONFIG, false, false, load_rc_map);
    }

    function load_rc_map() {
        MSP.send_message(MSP_codes.MSP_RCMAP, false, false, load_misc);
    }

    function load_misc() {
        MSP.send_message(MSP_codes.MSP_MISC, false, false, load_acc_trim);
    }

    function load_acc_trim() {
        MSP.send_message(MSP_codes.MSP_ACC_TRIM, false, false, load_html);
    }

    function load_html() {
        $('#content').load("./tabs/configuration.html", process_html);
    }

    MSP.send_message(MSP_codes.MSP_IDENT, false, false, load_config);

    function process_html() {
        // translate to user-selected language
        localize();

        var mixer_list_e = $('select.mixerList');
        for (var i = 0; i < mixerList.length; i++) {
            mixer_list_e.append('<option value="' + (i + 1) + '">' + mixerList[i].name + '</option>');
        }

        mixer_list_e.change(function () {
            var val = parseInt($(this).val());

            BF_CONFIG.mixerConfiguration = val;

            $('.mixerPreview img').attr('src', './resources/motor_order/' + mixerList[val - 1].image + '.svg');
        });

        // select current mixer configuration
        mixer_list_e.val(BF_CONFIG.mixerConfiguration).change();

        // generate features
        var featureNames = [
            {name: 'RX_PPM', description: 'PPM RX input'},
            {name: 'VBAT', description: 'Battery voltage monitoring'},
            {name: 'INFLIGHT_ACC_CAL', description: 'In-flight level calibration'},
            {name: 'RX_SERIAL', description: 'Serial-based receiver (SPEKSAT, SBUS, SUMD)'},
            {name: 'MOTOR_STOP', description: 'Don\'t spin the motors when armed'},
            {name: 'SERVO_TILT', description: 'Servo gimbal'},
            {name: 'SOFTSERIAL', description: 'Enable CPU based serial ports (configure port scenario first)'},
            {name: 'GPS', description: 'GPS (configure port scenario first)'},
            {name: 'FAILSAFE', description: 'Failsafe settings on RX signal loss'},
            {name: 'SONAR', description: 'Sonar'},
            {name: 'TELEMETRY', description: 'Telemetry output'},
            {name: 'CURRENT_METER', description: 'Battery current monitoring'},
            {name: '3D', description: '3D mode (for use with reversible ESCs)'},
            {name: 'RX_PARALLEL_PWM', description: 'PWM RX input'},
            {name: 'RX_MSP', description: 'MSP RX input'},
            {name: 'RSSI_ADC', description: 'Analog RSSI input'},
            {name: 'LED_STRIP', description: 'Addressable RGB LED strip support'},
            {name: 'DISPLAY', description: 'OLED Screen Display'},
            {name: 'ONESHOT125', description: 'ONESHOT ESC support (disconnect ESCs, remove props)'}
        ];

        var features_e = $('.features');
        for (var i = 0; i < featureNames.length; i++) {
            var row_e = $('<tr><td><input id="feature-' + i + '" title="' + featureNames[i].name + '" type="checkbox" /></td><td><label for="feature-' + i + '">' + featureNames[i].name + '</label></td><td>' + featureNames[i].description + '</td>');
            row_e.find('input').attr('checked', bit_check(BF_CONFIG.features, i));

            features_e.append(row_e);
        }

        // generate GPS
        var gpsTypes = [
            'NMEA',
            'UBLOX'
        ];

        /*
        var gpsBauds = [
            '115200',
            '57600',
            '38400',
            '19200',
            '9600'
        ];
        */

        var gpsSbas = [
            'Disabled',
            'Auto-detect',
            'European EGNOS',
            'North American WAAS',
            'Japanese MSAS',
            'Indian GAGAN'
        ];

        var gps_type_e = $('select.gps_type');
        for (var i = 0; i < gpsTypes.length; i++) {
            gps_type_e.append('<option value="' + i + '">' + gpsTypes[i] + '</option>');
        }

        gps_type_e.change(function () {
            MISC.gps_type = parseInt($(this).val());
        });

        /*
        var gps_baudrate_e = $('select.gps_baudrate');
        for (var i = 0; i < gpsBauds.length; i++) {
            gps_baudrate_e.append('<option value="' + i + '">' + gpsBauds[i] + '</option>');
        }

        gps_baudrate_e.change(function () {
            MISC.gps_baudrate = parseInt($(this).val());
        });
        */

        var gps_ubx_sbas_e = $('select.gps_ubx_sbas');
        for (var i = 0; i < gpsSbas.length; i++) {
            gps_ubx_sbas_e.append('<option value="' + (i - 1) + '">' + gpsSbas[i] + '</option>');
        }

        gps_ubx_sbas_e.change(function () {
            MISC.gps_ubx_sbas = parseInt($(this).val());
        });

        // select current gps configuration
        gps_type_e.val(MISC.gps_type);
        //gps_baudrate_e.val(MISC.gps_baudrate);
        gps_ubx_sbas_e.val(MISC.gps_ubx_sbas);

        // generate serial RX
        var serialRXtypes = [
            'SPEKTRUM1024',
            'SPEKTRUM2048',
            'SBUS',
            'SUMD',
            'SUMH'
        ];

        var serialRX_e = $('select.serialRX');
        for (var i = 0; i < serialRXtypes.length; i++) {
            serialRX_e.append('<option value="' + i + '">' + serialRXtypes[i] + '</option>');
        }

        serialRX_e.change(function () {
            BF_CONFIG.serialrx_type = parseInt($(this).val());
        });

        // select current serial RX type
        serialRX_e.val(BF_CONFIG.serialrx_type);

        // for some odd reason chrome 38+ changes scroll according to the touched select element
        // i am guessing this is a bug, since this wasn't happening on 37
        // code below is a temporary fix, which we will be able to remove in the future (hopefully)
        $('#content').scrollTop((scrollPosition) ? scrollPosition : 0);

        // fill board alignment
        $('input[name="board_align_roll"]').val(BF_CONFIG.board_align_roll);
        $('input[name="board_align_pitch"]').val(BF_CONFIG.board_align_pitch);
        $('input[name="board_align_yaw"]').val(BF_CONFIG.board_align_yaw);

        // fill accel trims
        $('input[name="roll"]').val(CONFIG.accelerometerTrims[1]);
        $('input[name="pitch"]').val(CONFIG.accelerometerTrims[0]);

        // fill magnetometer
        $('input[name="mag_declination"]').val(MISC.mag_declination);

        // fill throttle
        $('input[name="minthrottle"]').val(MISC.minthrottle);
        $('input[name="midthrottle"]').val(MISC.midrc);
        $('input[name="maxthrottle"]').val(MISC.maxthrottle);
        $('input[name="failsafe_throttle"]').val(MISC.failsafe_throttle);
        $('input[name="mincommand"]').val(MISC.mincommand);

        // fill battery
        $('input[name="mincellvoltage"]').val(MISC.vbatmincellvoltage);
        $('input[name="maxcellvoltage"]').val(MISC.vbatmaxcellvoltage);
        $('input[name="warningcellvoltage"]').val(MISC.vbatwarningcellvoltage);
        $('input[name="voltagescale"]').val(MISC.vbatscale);

        // fill current
        $('input[name="currentscale"]').val(BF_CONFIG.currentscale);
        $('input[name="currentoffset"]').val(BF_CONFIG.currentoffset);
        $('input[name="multiwiicurrentoutput"]').prop('checked', MISC.multiwiicurrentoutput);


        // UI hooks
        $('input', features_e).change(function () {
            var element = $(this),
                index = $('input', features_e).index(element),
                state = element.is(':checked');

            if (state) {
                BF_CONFIG.features = bit_set(BF_CONFIG.features, index);
            } else {
                BF_CONFIG.features = bit_clear(BF_CONFIG.features, index);
            }
        });

        $('a.save').click(function () {
            // gather data that doesn't have automatic change event bound
            BF_CONFIG.board_align_roll = parseInt($('input[name="board_align_roll"]').val());
            BF_CONFIG.board_align_pitch = parseInt($('input[name="board_align_pitch"]').val());
            BF_CONFIG.board_align_yaw = parseInt($('input[name="board_align_yaw"]').val());

            CONFIG.accelerometerTrims[1] = parseInt($('input[name="roll"]').val());
            CONFIG.accelerometerTrims[0] = parseInt($('input[name="pitch"]').val());
            MISC.mag_declination = parseFloat($('input[name="mag_declination"]').val());

            MISC.minthrottle = parseInt($('input[name="minthrottle"]').val());
            MISC.midrc = parseInt($('input[name="midthrottle"]').val());
            MISC.maxthrottle = parseInt($('input[name="maxthrottle"]').val());
            MISC.failsafe_throttle = parseInt($('input[name="failsafe_throttle"]').val());
            MISC.mincommand = parseInt($('input[name="mincommand"]').val());

            MISC.vbatmincellvoltage = parseFloat($('input[name="mincellvoltage"]').val());
            MISC.vbatmaxcellvoltage = parseFloat($('input[name="maxcellvoltage"]').val());
            MISC.vbatwarningcellvoltage = parseFloat($('input[name="warningcellvoltage"]').val());
            MISC.vbatscale = parseInt($('input[name="voltagescale"]').val());

            BF_CONFIG.currentscale = parseInt($('input[name="currentscale"]').val());
            BF_CONFIG.currentoffset = parseInt($('input[name="currentoffset"]').val());
            MISC.multiwiicurrentoutput = ~~$('input[name="multiwiicurrentoutput"]').is(':checked'); // ~~ boolean to decimal conversion

            function save_misc() {
                MSP.send_message(MSP_codes.MSP_SET_MISC, MSP.crunch(MSP_codes.MSP_SET_MISC), false, save_acc_trim);
            }

            function save_acc_trim() {
                MSP.send_message(MSP_codes.MSP_SET_ACC_TRIM, MSP.crunch(MSP_codes.MSP_SET_ACC_TRIM), false, save_to_eeprom);
            }

            function save_to_eeprom() {
                MSP.send_message(MSP_codes.MSP_EEPROM_WRITE, false, false, reboot);
            }

            function reboot() {
                GUI.log(chrome.i18n.getMessage('configurationEepromSaved'));

                GUI.tab_switch_cleanup(function() {
                    MSP.send_message(MSP_codes.MSP_SET_REBOOT, false, false, reinitialize);
                });
            }

            function reinitialize() {
                GUI.log(chrome.i18n.getMessage('deviceRebooting'));

                GUI.timeout_add('waiting_for_bootup', function waiting_for_bootup() {
                    MSP.send_message(MSP_codes.MSP_IDENT, false, false, function () {
                        GUI.log(chrome.i18n.getMessage('deviceReady'));
                        TABS.configuration.initialize(false, $('#content').scrollTop());
                    });
                },1500); // 1500 ms seems to be just the right amount of delay to prevent data request timeouts
            }

            MSP.send_message(MSP_codes.MSP_SET_CONFIG, MSP.crunch(MSP_codes.MSP_SET_CONFIG), false, save_misc);
        });

        // status data pulled via separate timer with static speed
        GUI.interval_add('status_pull', function status_pull() {
            MSP.send_message(MSP_codes.MSP_STATUS);
        }, 250, true);

        if (callback) callback();
    }
};

TABS.configuration.cleanup = function (callback) {
    if (callback) callback();
};