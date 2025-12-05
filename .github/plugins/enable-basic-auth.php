<?php
/**
 * Plugin Name: Enable Basic Auth for REST API
 * Description: Allows Basic Authentication with regular passwords for REST API in development/testing
 * Version: 1.0
 */

add_filter('determine_current_user', function($user_id) {
    if (!empty($_SERVER['PHP_AUTH_USER']) && !empty($_SERVER['PHP_AUTH_PW'])) {
        $user = wp_authenticate($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']);
        if (!is_wp_error($user)) {
            return $user->ID;
        }
    }
    return $user_id;
}, 20);

add_filter('rest_authentication_errors', function($result) {
    if (!empty($result)) {
        return $result;
    }
    if (!empty($_SERVER['PHP_AUTH_USER']) && !empty($_SERVER['PHP_AUTH_PW'])) {
        $user = wp_authenticate($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']);
        if (!is_wp_error($user)) {
            return true;
        }
    }
    return $result;
});

