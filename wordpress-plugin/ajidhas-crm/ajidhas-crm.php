<?php
/**
 * Plugin Name: Ajidhas & Associates CRM & Headless Content Manager
 * Plugin URI: https://ajidhasassociates.com
 * Description: Complete Headless CMS & Lead CRM solution for Ajidhas & Associates. Manage all site section text, images, background images, portfolio projects, and client inquiries from WordPress.
 * Version: 1.1.0
 * Author: Ajidhas & Associates
 * Author URI: https://ajidhasassociates.com
 * Text Domain: ajidhas-crm
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class Ajidhas_CRM_Content_Manager {

    private static $instance = null;
    private $option_key = 'ajidhas_site_content';

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        // Activation & Deactivation Hooks
        register_activation_hook(__FILE__, array($this, 'activate_plugin'));

        // Admin & REST API Actions
        add_action('admin_menu', array($this, 'register_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('init', array($this, 'register_custom_post_types'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('rest_api_init', array($this, 'setup_cors_headers'), 15);
        add_filter('rest_pre_serve_request', array($this, 'handle_cors_preflight'));
    }

    /**
     * Plugin Activation Routine
     */
    public function activate_plugin() {
        $this->register_custom_post_types();
        $this->create_inquiries_db_table();
        $this->seed_default_content();
        flush_rewrite_rules();
    }

    /**
     * Create Custom Inquiries Table for Lead CRM
     */
    private function create_inquiries_db_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ajidhas_inquiries';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            email varchar(255) NOT NULL,
            phone varchar(50) DEFAULT '',
            subject varchar(255) DEFAULT '',
            message text NOT NULL,
            type varchar(50) DEFAULT 'general',
            status varchar(50) DEFAULT 'new',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * Seed Default Content for All Sections
     */
    private function seed_default_content() {
        if (get_option($this->option_key)) {
            return;
        }

        $defaults = array(
            'general' => array(
                'site_title' => 'Ajidhas and Associates',
                'site_subtitle' => 'Architecture & Art Studio',
                'logo_url' => '',
                'contact_email' => 'ajidhassandassociates@gmail.com',
                'contact_phone' => '+91 9790847621',
                'contact_address' => "Chennai, India\nAvailable Worldwide",
                'footer_copyright' => '© 2026 Ajidhas & Associates. All rights reserved.',
            ),
            'home' => array(
                'hero_title' => 'Ajidhas and Associates',
                'hero_subtitle' => 'Architecture & Art Studio',
                'bg_image' => '',
                'art_button_text' => 'Art',
                'architecture_button_text' => 'Architecture',
            ),
            'architecture' => array(
                'header_title' => 'Architecture',
                'subtitle' => 'Timeless spatial forms, sustainable engineering, and human-centric living.',
                'bg_images' => array('', '', ''),
            ),
            'art' => array(
                'header_title' => 'Art Studio',
                'subtitle' => 'Exploring the Boundaries of Space, Light & Form',
                'bg_image' => '',
                'artist_name' => 'Ajidhas',
                'artist_role' => 'Principal Artist & Architect',
                'artist_bio' => 'Blending architectural precision with abstract expressionism.',
                'artist_image' => '',
            ),
            'about' => array(
                'header_title' => 'About Our Studio',
                'studio_description' => 'A collective of visionary architects, designers, and artists crafting timeless environments.',
                'team' => array(
                    array('name' => 'Ajidhas', 'role' => 'Principal Architect', 'image' => '', 'bio' => 'A visionary leader with over 15 years of experience in sustainable urban design.'),
                    array('name' => 'Pradeep', 'role' => 'Creative Director', 'image' => '', 'bio' => 'Pradeep brings a unique artistic perspective to every project.'),
                    array('name' => 'Sarah Chen', 'role' => 'Lead Designer', 'image' => '', 'bio' => 'Sarah specializes in minimalist residential architecture.'),
                    array('name' => 'Marcus Vane', 'role' => 'Technical Lead', 'image' => '', 'bio' => 'Marcus bridges the gap between complex engineering and architectural beauty.')
                )
            ),
            'visualisation' => array(
                'header_title' => 'Visualisation & 3D Renders',
                'subtitle' => 'Hyper-realistic digital spaces and architectural storytelling.',
                'bg_image' => '',
            ),
            'technology' => array(
                'header_title' => 'Tech & Innovation',
                'subtitle' => 'Parametric modeling, computational geometry, and smart building integration.',
                'bg_image' => '',
            ),
            'landscape' => array(
                'header_title' => 'Landscape Architecture',
                'subtitle' => 'Designing living ecosystems that harmonize human dwellings with nature.',
                'bg_image' => '',
            ),
            'interior' => array(
                'header_title' => 'Interior Architecture',
                'subtitle' => 'Curated spaces, material palettes, and bespoke light dynamics.',
                'bg_image' => '',
            ),
            'collaboration' => array(
                'header_title' => 'Collaboration & Research',
                'subtitle' => 'Partnering with global visionaries, structural engineers, and artists.',
                'bg_image' => '',
            ),
            'contact' => array(
                'title' => "Let's Build\nTogether.",
                'subtitle' => 'Reach out to collaborate on your next architectural or art vision.',
                'bg_image' => '',
            )
        );

        update_option($this->option_key, $defaults);
    }

    /**
     * Register Custom Post Types for Projects
     */
    public function register_custom_post_types() {
        $labels = array(
            'name'                  => _x('Projects', 'Post Type General Name', 'ajidhas-crm'),
            'singular_name'         => _x('Project', 'Post Type Singular Name', 'ajidhas-crm'),
            'menu_name'             => __('Ajidhas Projects', 'ajidhas-crm'),
            'all_items'             => __('All Projects', 'ajidhas-crm'),
            'add_new_item'          => __('Add New Project', 'ajidhas-crm'),
            'edit_item'             => __('Edit Project', 'ajidhas-crm'),
        );
        $args = array(
            'label'                 => __('Project', 'ajidhas-crm'),
            'labels'                => $labels,
            'supports'              => array('title', 'editor', 'thumbnail', 'custom-fields', 'excerpt'),
            'public'                => true,
            'show_ui'               => true,
            'show_in_menu'          => 'ajidhas-crm-dashboard',
            'show_in_rest'          => true,
            'has_archive'           => true,
            'rest_base'             => 'projects',
        );
        register_post_type('ajidhas_project', $args);
    }

    /**
     * Register WP Admin Menu & Pages
     */
    public function register_admin_menu() {
        add_menu_page(
            'Ajidhas CRM',
            'Ajidhas CRM',
            'manage_options',
            'ajidhas-crm-dashboard',
            array($this, 'render_admin_dashboard'),
            'dashicons-building',
            3
        );

        add_submenu_page(
            'ajidhas-crm-dashboard',
            'Section Text & Media Manager',
            'Section Text & Media',
            'manage_options',
            'ajidhas-crm-content',
            array($this, 'render_content_manager_page')
        );

        add_submenu_page(
            'ajidhas-crm-dashboard',
            'Leads & Inquiries CRM',
            'Leads CRM',
            'manage_options',
            'ajidhas-crm-leads',
            array($this, 'render_leads_crm_page')
        );
    }

    /**
     * Enqueue Admin Assets & WP Media Uploader
     */
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'ajidhas-crm') !== false) {
            wp_enqueue_media();
            wp_enqueue_style('ajidhas-admin-css', false);
            $css = "
                .ajidhas-wrap { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 1200px; margin: 20px 0; }
                .ajidhas-card { background: #fff; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-radius: 8px; padding: 24px; margin-bottom: 24px; }
                .ajidhas-nav-tab-wrapper { border-bottom: 1px solid #ccc; margin-bottom: 20px; display: flex; gap: 6px; flex-wrap: wrap; }
                .ajidhas-tab-btn { padding: 9px 15px; background: #e2e8f0; border: none; border-radius: 6px 6px 0 0; cursor: pointer; font-weight: 600; font-size: 13px; color: #334155; }
                .ajidhas-tab-btn.active { background: #0f172a; color: #fff; }
                .ajidhas-tab-content { display: none; }
                .ajidhas-tab-content.active { display: block; }
                .form-row { margin-bottom: 20px; }
                .form-row label { display: block; font-weight: 600; margin-bottom: 6px; color: #1e293b; }
                .form-row input[type='text'], .form-row textarea, .form-row select { width: 100%; max-width: 650px; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; }
                .img-preview { max-width: 200px; max-height: 120px; margin-top: 10px; border-radius: 6px; border: 1px solid #cbd5e1; display: block; background: #f8fafc; object-fit: cover; }
                .upload-btn { background: #2563eb; color: #fff; border: none; padding: 7px 14px; border-radius: 5px; cursor: pointer; margin-top: 6px; display: inline-block; font-size: 13px; font-weight: 600; }
                .upload-btn:hover { background: #1d4ed8; }
                .clear-btn { background: #ef4444; color: #fff; border: none; padding: 7px 14px; border-radius: 5px; cursor: pointer; margin-top: 6px; margin-left: 6px; font-size: 13px; font-weight: 600; }
                .crm-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                .crm-table th, .crm-table td { padding: 12px 15px; border: 1px solid #e2e8f0; text-align: left; }
                .crm-table th { background: #f8fafc; font-weight: 700; color: #1e293b; }
                .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
                .status-new { background: #dbeafe; color: #1e40af; }
                .status-contacted { background: #fef3c7; color: #92400e; }
                .status-in_progress { background: #e0e7ff; color: #3730a3; }
                .status-closed { background: #dcfce7; color: #166534; }
                .btn-save { background: #0f172a; color: #fff; font-weight: 700; padding: 12px 28px; border: none; border-radius: 6px; cursor: pointer; font-size: 15px; }
                .btn-save:hover { background: #334155; }
            ";
            wp_add_inline_style('wp-admin', $css);
        }
    }

    /**
     * Render Admin Dashboard
     */
    public function render_admin_dashboard() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ajidhas_inquiries';
        $total_leads = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
        $new_leads = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'new'");
        $total_projects = wp_count_posts('ajidhas_project')->publish;

        echo '<div class="wrap ajidhas-wrap">';
        echo '<h1> Ajidhas & Associates — Section Content & Lead CRM</h1>';
        echo '<p style="font-size: 15px; color: #475569;">Manage all section text, page images, hero backgrounds, and lead inquiries without affecting your frontend UI layout.</p>';

        echo '<div style="display: flex; gap: 20px; margin-top: 25px;">';
        
        echo '<div class="ajidhas-card" style="flex: 1; border-top: 4px solid #3b82f6;">';
        echo '<h3 style="margin-top: 0; color: #1e293b;">📥 Total Inquiries</h3>';
        echo '<div style="font-size: 36px; font-weight: 700; color: #3b82f6;">' . esc_html($total_leads) . '</div>';
        echo '<p><a href="' . admin_url('admin.php?page=ajidhas-crm-leads') . '" class="button button-primary">View Leads CRM</a></p>';
        echo '</div>';

        echo '<div class="ajidhas-card" style="flex: 1; border-top: 4px solid #10b981;">';
        echo '<h3 style="margin-top: 0; color: #1e293b;">⭐ New Unread Leads</h3>';
        echo '<div style="font-size: 36px; font-weight: 700; color: #10b981;">' . esc_html($new_leads) . '</div>';
        echo '<p><a href="' . admin_url('admin.php?page=ajidhas-crm-leads') . '" class="button">Manage New Leads</a></p>';
        echo '</div>';

        echo '<div class="ajidhas-card" style="flex: 1; border-top: 4px solid #8b5cf6;">';
        echo '<h3 style="margin-top: 0; color: #1e293b;">🖼️ Published Projects</h3>';
        echo '<div style="font-size: 36px; font-weight: 700; color: #8b5cf6;">' . esc_html($total_projects) . '</div>';
        echo '<p><a href="' . admin_url('edit.php?post_type=ajidhas_project') . '" class="button">Manage Projects</a></p>';
        echo '</div>';

        echo '</div>';

        echo '<div class="ajidhas-card" style="margin-top: 10px;">';
        echo '<h3> Headless REST API Integration Status</h3>';
        echo '<ul>';
        echo '<li><strong>Section Content API:</strong> <code>' . esc_url(rest_url('ajidhas/v1/content')) . '</code></li>';
        echo '<li><strong>Projects API:</strong> <code>' . esc_url(rest_url('ajidhas/v1/projects')) . '</code></li>';
        echo '<li><strong>Inquiries Endpoint:</strong> <code>' . esc_url(rest_url('ajidhas/v1/inquiry')) . '</code></li>';
        echo '</ul>';
        echo '</div>';

        echo '</div>';
    }

    /**
     * Render Content Manager Page with Tabs for ALL Sections
     */
    public function render_content_manager_page() {
        if (!current_user_can('manage_options')) return;

        if (isset($_POST['ajidhas_save_content']) && check_admin_referer('ajidhas_content_nonce')) {
            $posted_data = isset($_POST['ajidhas_content']) ? $_POST['ajidhas_content'] : array();
            update_option($this->option_key, $posted_data);
            echo '<div class="updated"><p><strong>Success!</strong> All section text, images, and background images saved.</p></div>';
        }

        $content = get_option($this->option_key, array());

        ?>
        <div class="wrap ajidhas-wrap">
            <h1> All Sections — Text, Image & Background Image Manager</h1>
            <p>Select images from your WordPress Media Library or enter image URLs to update your React website dynamically without breaking UI layout.</p>

            <form method="post" action="">
                <?php wp_nonce_field('ajidhas_content_nonce'); ?>

                <div class="ajidhas-nav-tab-wrapper">
                    <button type="button" class="ajidhas-tab-btn active" onclick="openTab(event, 'tab-general')">🌐 General & Branding</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-home')">🏠 Home</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-architecture')">🏛️ Architecture</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-art')">🎨 Art Studio</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-gallery')">🖼️ Gallery Series</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-about')">👥 About Studio</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-vis')">🖼️ Visualisation</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-tech')">⚡ Technology</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-landscape')">🌿 Landscape</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-interior')">🛋️ Interior</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-collab')">🤝 Collaboration</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-contact')">📞 Contact</button>
                </div>

                <!-- Tab General -->
                <div id="tab-general" class="ajidhas-tab-content active ajidhas-card">
                    <h2>General & Studio Branding</h2>
                    <div class="form-row">
                        <label>Site Main Title</label>
                        <input type="text" name="ajidhas_content[general][site_title]" value="<?php echo esc_attr($content['general']['site_title'] ?? 'Ajidhas and Associates'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Studio Tagline / Subtitle</label>
                        <input type="text" name="ajidhas_content[general][site_subtitle]" value="<?php echo esc_attr($content['general']['site_subtitle'] ?? 'Architecture & Art Studio'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Main Logo Image</label>
                        <input type="text" id="logo_url" name="ajidhas_content[general][logo_url]" value="<?php echo esc_url($content['general']['logo_url'] ?? ''); ?>" placeholder="Leave blank to use local logo asset" />
                        <button type="button" class="upload-btn" onclick="selectMedia('logo_url', 'logo_preview')">Upload / Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('logo_url', 'logo_preview')">Clear</button>
                        <img id="logo_preview" class="img-preview" src="<?php echo esc_url($content['general']['logo_url'] ?? ''); ?>" style="<?php echo empty($content['general']['logo_url']) ? 'display:none;' : ''; ?>" />
                    </div>
                    <div class="form-row">
                        <label>Contact Email</label>
                        <input type="text" name="ajidhas_content[general][contact_email]" value="<?php echo esc_attr($content['general']['contact_email'] ?? 'ajidhassandassociates@gmail.com'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Contact Phone</label>
                        <input type="text" name="ajidhas_content[general][contact_phone]" value="<?php echo esc_attr($content['general']['contact_phone'] ?? '+91 9790847621'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Office Address</label>
                        <textarea name="ajidhas_content[general][contact_address]" rows="3"><?php echo esc_textarea($content['general']['contact_address'] ?? "Chennai, India\nAvailable Worldwide"); ?></textarea>
                    </div>
                </div>

                <!-- Tab Home -->
                <div id="tab-home" class="ajidhas-tab-content ajidhas-card">
                    <h2>Home Section Settings</h2>
                    <div class="form-row">
                        <label>Hero Headline</label>
                        <input type="text" name="ajidhas_content[home][hero_title]" value="<?php echo esc_attr($content['home']['hero_title'] ?? 'Ajidhas and Associates'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Hero Subtitle</label>
                        <input type="text" name="ajidhas_content[home][hero_subtitle]" value="<?php echo esc_attr($content['home']['hero_subtitle'] ?? 'Architecture & Art Studio'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Home Background Image</label>
                        <input type="text" id="home_bg" name="ajidhas_content[home][bg_image]" value="<?php echo esc_url($content['home']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('home_bg', 'home_bg_preview')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('home_bg', 'home_bg_preview')">Clear</button>
                        <img id="home_bg_preview" class="img-preview" src="<?php echo esc_url($content['home']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['home']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>
                </div>

                <!-- Tab Architecture -->
                <div id="tab-architecture" class="ajidhas-tab-content ajidhas-card">
                    <h2>Architecture Section Settings</h2>
                    <div class="form-row">
                        <label>Header Title</label>
                        <input type="text" name="ajidhas_content[architecture][header_title]" value="<?php echo esc_attr($content['architecture']['header_title'] ?? 'Architecture'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Background Image 1 (Night View)</label>
                        <input type="text" id="arch_bg_0" name="ajidhas_content[architecture][bg_images][0]" value="<?php echo esc_url($content['architecture']['bg_images'][0] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('arch_bg_0', 'arch_bg_0_preview')">Choose Image</button>
                        <img id="arch_bg_0_preview" class="img-preview" src="<?php echo esc_url($content['architecture']['bg_images'][0] ?? ''); ?>" style="<?php echo empty($content['architecture']['bg_images'][0]) ? 'display:none;' : ''; ?>" />
                    </div>
                    <div class="form-row">
                        <label>Background Image 2 (Structure)</label>
                        <input type="text" id="arch_bg_1" name="ajidhas_content[architecture][bg_images][1]" value="<?php echo esc_url($content['architecture']['bg_images'][1] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('arch_bg_1', 'arch_bg_1_preview')">Choose Image</button>
                        <img id="arch_bg_1_preview" class="img-preview" src="<?php echo esc_url($content['architecture']['bg_images'][1] ?? ''); ?>" style="<?php echo empty($content['architecture']['bg_images'][1]) ? 'display:none;' : ''; ?>" />
                    </div>
                    <div class="form-row">
                        <label>Background Image 3 (Interior / Facade)</label>
                        <input type="text" id="arch_bg_2" name="ajidhas_content[architecture][bg_images][2]" value="<?php echo esc_url($content['architecture']['bg_images'][2] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('arch_bg_2', 'arch_bg_2_preview')">Choose Image</button>
                        <img id="arch_bg_2_preview" class="img-preview" src="<?php echo esc_url($content['architecture']['bg_images'][2] ?? ''); ?>" style="<?php echo empty($content['architecture']['bg_images'][2]) ? 'display:none;' : ''; ?>" />
                    </div>
                </div>

                <!-- Tab Art -->
                <div id="tab-art" class="ajidhas-tab-content ajidhas-card">
                    <h2>Art Studio Section Settings</h2>
                    <div class="form-row">
                        <label>Art Header Title</label>
                        <input type="text" name="ajidhas_content[art][header_title]" value="<?php echo esc_attr($content['art']['header_title'] ?? 'Art Studio'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Art Subtitle</label>
                        <input type="text" name="ajidhas_content[art][subtitle]" value="<?php echo esc_attr($content['art']['subtitle'] ?? 'Exploring the Boundaries of Space, Light & Form'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Art Section Background Image</label>
                        <input type="text" id="art_bg" name="ajidhas_content[art][bg_image]" value="<?php echo esc_url($content['art']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('art_bg', 'art_bg_preview')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('art_bg', 'art_bg_preview')">Clear</button>
                        <img id="art_bg_preview" class="img-preview" src="<?php echo esc_url($content['art']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['art']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>
                    <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <h3> Principal Artist Profile</h3>
                    <div class="form-row">
                        <label>Artist Name</label>
                        <input type="text" name="ajidhas_content[art][artist_name]" value="<?php echo esc_attr($content['art']['artist_name'] ?? 'Ajidhas'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Artist Role</label>
                        <input type="text" name="ajidhas_content[art][artist_role]" value="<?php echo esc_attr($content['art']['artist_role'] ?? 'Principal Artist & Architect'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Artist Biography</label>
                        <textarea name="ajidhas_content[art][artist_bio]" rows="3"><?php echo esc_textarea($content['art']['artist_bio'] ?? 'Blending architectural precision with abstract expressionism.'); ?></textarea>
                    </div>
                    <div class="form-row">
                        <label>Artist Profile Photo</label>
                        <input type="text" id="artist_img" name="ajidhas_content[art][artist_image]" value="<?php echo esc_url($content['art']['artist_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('artist_img', 'artist_img_preview')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('artist_img', 'artist_img_preview')">Clear</button>
                        <img id="artist_img_preview" class="img-preview" src="<?php echo esc_url($content['art']['artist_image'] ?? ''); ?>" style="<?php echo empty($content['art']['artist_image']) ? 'display:none;' : ''; ?>" />
                    </div>
                </div>

                <!-- Tab Gallery Series -->
                <div id="tab-gallery" class="ajidhas-tab-content ajidhas-card">
                    <h2>Gallery Series Settings</h2>
                    <div class="form-row">
                        <label>Header Label</label>
                        <input type="text" name="ajidhas_content[gallery][header_label]" value="<?php echo esc_attr($content['gallery']['header_label'] ?? 'Gallery'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Header Title</label>
                        <input type="text" name="ajidhas_content[gallery][header_title]" value="<?php echo esc_attr($content['gallery']['header_title'] ?? 'Artistic Series'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Footer Hint Text</label>
                        <input type="text" name="ajidhas_content[gallery][footer_hint]" value="<?php echo esc_attr($content['gallery']['footer_hint'] ?? 'Scroll to explore'); ?>" />
                    </div>
                </div>

                <!-- Tab About -->
                <div id="tab-about" class="ajidhas-tab-content ajidhas-card">
                    <h2>About Studio & Team Members</h2>
                    <div class="form-row">
                        <label>Header Title</label>
                        <input type="text" name="ajidhas_content[about][header_title]" value="<?php echo esc_attr($content['about']['header_title'] ?? 'About Our Studio'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Studio Overview Paragraph</label>
                        <textarea name="ajidhas_content[about][studio_description]" rows="3"><?php echo esc_textarea($content['about']['studio_description'] ?? 'A collective of visionary architects, designers, and artists crafting timeless environments.'); ?></textarea>
                    </div>

                    <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <h3> Team Members (3D Interactive Carousel)</h3>

                    <?php 
                    $default_team = array(
                        array('name' => 'Ajidhas', 'role' => 'Principal Architect', 'image' => '', 'bio' => 'A visionary leader with over 15 years of experience in sustainable urban design.'),
                        array('name' => 'Pradeep', 'role' => 'Creative Director', 'image' => '', 'bio' => 'Pradeep brings a unique artistic perspective to every project.'),
                        array('name' => 'Sarah Chen', 'role' => 'Lead Designer', 'image' => '', 'bio' => 'Sarah specializes in minimalist residential architecture.'),
                        array('name' => 'Marcus Vane', 'role' => 'Technical Lead', 'image' => '', 'bio' => 'Marcus bridges the gap between complex engineering and architectural beauty.')
                    );
                    $team = !empty($content['about']['team']) && is_array($content['about']['team']) ? $content['about']['team'] : $default_team;
                    for ($t = 0; $t < 4; $t++) :
                        $t_name = $team[$t]['name'] ?? $default_team[$t]['name'];
                        $t_role = $team[$t]['role'] ?? $default_team[$t]['role'];
                        $t_img = $team[$t]['image'] ?? '';
                        $t_bio = $team[$t]['bio'] ?? $default_team[$t]['bio'];
                    ?>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <h4 style="margin: 0 0 10px 0; color: #0f172a;">Member #<?php echo ($t + 1); ?>: <?php echo esc_html($t_name); ?></h4>
                            <div class="form-row">
                                <label>Name</label>
                                <input type="text" name="ajidhas_content[about][team][<?php echo $t; ?>][name]" value="<?php echo esc_attr($t_name); ?>" />
                            </div>
                            <div class="form-row">
                                <label>Role / Position</label>
                                <input type="text" name="ajidhas_content[about][team][<?php echo $t; ?>][role]" value="<?php echo esc_attr($t_role); ?>" />
                            </div>
                            <div class="form-row">
                                <label>Biography</label>
                                <textarea name="ajidhas_content[about][team][<?php echo $t; ?>][bio]" rows="2"><?php echo esc_textarea($t_bio); ?></textarea>
                            </div>
                            <div class="form-row">
                                <label>Photo</label>
                                <input type="text" id="team_img_<?php echo $t; ?>" name="ajidhas_content[about][team][<?php echo $t; ?>][image]" value="<?php echo esc_url($t_img); ?>" />
                                <button type="button" class="upload-btn" onclick="selectMedia('team_img_<?php echo $t; ?>', 'team_img_preview_<?php echo $t; ?>')">Choose Photo</button>
                                <button type="button" class="clear-btn" onclick="clearMedia('team_img_<?php echo $t; ?>', 'team_img_preview_<?php echo $t; ?>')">Clear</button>
                                <img id="team_img_preview_<?php echo $t; ?>" class="img-preview" src="<?php echo esc_url($t_img); ?>" style="<?php echo empty($t_img) ? 'display:none;' : ''; ?>" />
                            </div>
                        </div>
                    <?php endfor; ?>
                </div>

                <!-- Tab Visualisation -->
                <div id="tab-vis" class="ajidhas-tab-content ajidhas-card">
                    <h2>Visualisation Section Settings</h2>
                    <div class="form-row">
                        <label>Visualisation Section Title</label>
                        <input type="text" name="ajidhas_content[visualisation][header_title]" value="<?php echo esc_attr($content['visualisation']['header_title'] ?? 'Visualisation & 3D Renders'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Visualisation Background Image</label>
                        <input type="text" id="vis_bg" name="ajidhas_content[visualisation][bg_image]" value="<?php echo esc_url($content['visualisation']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('vis_bg', 'vis_bg_preview')">Choose Image</button>
                        <img id="vis_bg_preview" class="img-preview" src="<?php echo esc_url($content['visualisation']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['visualisation']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>
                </div>

                <!-- Tab Technology -->
                <div id="tab-tech" class="ajidhas-tab-content ajidhas-card">
                    <h2>Technology Section Settings</h2>
                    <div class="form-row">
                        <label>Technology Section Title</label>
                        <input type="text" name="ajidhas_content[technology][header_title]" value="<?php echo esc_attr($content['technology']['header_title'] ?? 'Tech & Innovation'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Technology Background Image</label>
                        <input type="text" id="tech_bg" name="ajidhas_content[technology][bg_image]" value="<?php echo esc_url($content['technology']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('tech_bg', 'tech_bg_preview')">Choose Image</button>
                        <img id="tech_bg_preview" class="img-preview" src="<?php echo esc_url($content['technology']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['technology']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>
                </div>

                <!-- Tab Landscape -->
                <div id="tab-landscape" class="ajidhas-tab-content ajidhas-card">
                    <h2>Landscape Section Settings</h2>
                    <div class="form-row">
                        <label>Landscape Section Title</label>
                        <input type="text" name="ajidhas_content[landscape][header_title]" value="<?php echo esc_attr($content['landscape']['header_title'] ?? 'Landscape Architecture'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Landscape Background Image</label>
                        <input type="text" id="landscape_bg" name="ajidhas_content[landscape][bg_image]" value="<?php echo esc_url($content['landscape']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('landscape_bg', 'landscape_bg_preview')">Choose Image</button>
                        <img id="landscape_bg_preview" class="img-preview" src="<?php echo esc_url($content['landscape']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['landscape']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>
                </div>

                <!-- Tab Interior -->
                <div id="tab-interior" class="ajidhas-tab-content ajidhas-card">
                    <h2>Interior Section Settings</h2>
                    <div class="form-row">
                        <label>Interior Section Title</label>
                        <input type="text" name="ajidhas_content[interior][header_title]" value="<?php echo esc_attr($content['interior']['header_title'] ?? 'Interior Architecture'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Interior Background Image</label>
                        <input type="text" id="interior_bg" name="ajidhas_content[interior][bg_image]" value="<?php echo esc_url($content['interior']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('interior_bg', 'interior_bg_preview')">Choose Image</button>
                        <img id="interior_bg_preview" class="img-preview" src="<?php echo esc_url($content['interior']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['interior']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>
                </div>

                <!-- Tab Collaboration -->
                <div id="tab-collab" class="ajidhas-tab-content ajidhas-card">
                    <h2>Collaboration Section Settings</h2>
                    <div class="form-row">
                        <label>Collaboration Title</label>
                        <input type="text" name="ajidhas_content[collaboration][header_title]" value="<?php echo esc_attr($content['collaboration']['header_title'] ?? 'Collaboration & Research'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Collaboration Background Image</label>
                        <input type="text" id="collab_bg" name="ajidhas_content[collaboration][bg_image]" value="<?php echo esc_url($content['collaboration']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('collab_bg', 'collab_bg_preview')">Choose Image</button>
                        <img id="collab_bg_preview" class="img-preview" src="<?php echo esc_url($content['collaboration']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['collaboration']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>
                </div>

                <!-- Tab Contact -->
                <div id="tab-contact" class="ajidhas-tab-content ajidhas-card">
                    <h2>Contact Section Settings</h2>
                    <div class="form-row">
                        <label>Contact Title</label>
                        <input type="text" name="ajidhas_content[contact][title]" value="<?php echo esc_attr($content['contact']['title'] ?? "Let's Build\nTogether."); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Contact Background Image</label>
                        <input type="text" id="contact_bg" name="ajidhas_content[contact][bg_image]" value="<?php echo esc_url($content['contact']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('contact_bg', 'contact_bg_preview')">Choose Image</button>
                        <img id="contact_bg_preview" class="img-preview" src="<?php echo esc_url($content['contact']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['contact']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>
                </div>

                <p><input type="submit" name="ajidhas_save_content" class="btn-save" value="💾 Save All Section Text & Media Changes" /></p>
            </form>
        </div>

        <script>
        function openTab(evt, tabId) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("ajidhas-tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].classList.remove("active");
            }
            tablinks = document.getElementsByClassName("ajidhas-tab-btn");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].classList.remove("active");
            }
            document.getElementById(tabId).classList.add("active");
            evt.currentTarget.classList.add("active");
        }

        function selectMedia(inputId, previewId) {
            var frame = wp.media({
                title: 'Select or Upload Media Asset',
                button: { text: 'Use Selected Media' },
                multiple: false
            });

            frame.on('select', function() {
                var attachment = frame.state().get('selection').first().toJSON();
                document.getElementById(inputId).value = attachment.url;
                var preview = document.getElementById(previewId);
                if (preview) {
                    preview.src = attachment.url;
                    preview.style.display = 'block';
                }
            });

            frame.open();
        }

        function clearMedia(inputId, previewId) {
            document.getElementById(inputId).value = '';
            var preview = document.getElementById(previewId);
            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
        }
        </script>
        <?php
    }

    /**
     * Render Leads CRM Page
     */
    public function render_leads_crm_page() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ajidhas_inquiries';

        if (isset($_GET['action'], $_GET['lead_id']) && $_GET['action'] === 'update_status' && check_admin_referer('update_lead_' . $_GET['lead_id'])) {
            $new_status = sanitize_text_field($_GET['status']);
            $lead_id = intval($_GET['lead_id']);
            $wpdb->update($table_name, array('status' => $new_status), array('id' => $lead_id));
            echo '<div class="updated"><p>Lead status updated to <strong>' . esc_html($new_status) . '</strong>.</p></div>';
        }

        if (isset($_GET['action'], $_GET['lead_id']) && $_GET['action'] === 'delete_lead' && check_admin_referer('delete_lead_' . $_GET['lead_id'])) {
            $lead_id = intval($_GET['lead_id']);
            $wpdb->delete($table_name, array('id' => $lead_id));
            echo '<div class="updated"><p>Lead record deleted.</p></div>';
        }

        $leads = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC");

        ?>
        <div class="wrap ajidhas-wrap">
            <h1> Client Leads & Form Inquiries CRM</h1>
            <p>All client inquiries received from your React contact forms are stored here securely in real-time.</p>

            <div class="ajidhas-card">
                <?php if (empty($leads)) : ?>
                    <p style="color: #666; font-style: italic;">No inquiries received yet. Test your contact form from the frontend website!</p>
                <?php else : ?>
                    <table class="crm-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Client Name</th>
                                <th>Email Address</th>
                                <th>Inquiry Type</th>
                                <th>Subject & Message</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($leads as $lead) : ?>
                                <tr>
                                    <td><small><?php echo esc_html(date('M j, Y g:i a', strtotime($lead->created_at))); ?></small></td>
                                    <td><strong><?php echo esc_html($lead->name); ?></strong></td>
                                    <td><a href="mailto:<?php echo esc_attr($lead->email); ?>"><?php echo esc_html($lead->email); ?></a></td>
                                    <td><span style="background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-size: 12px;"><?php echo esc_html(ucfirst($lead->type)); ?></span></td>
                                    <td>
                                        <strong><?php echo esc_html($lead->subject); ?></strong>
                                        <p style="margin: 4px 0 0 0; color: #475569; font-size: 13px; max-width: 350px;"><?php echo nl2br(esc_html($lead->message)); ?></p>
                                    </td>
                                    <td>
                                        <span class="status-badge status-<?php echo esc_attr($lead->status); ?>">
                                            <?php echo esc_html(str_replace('_', ' ', $lead->status)); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <select onchange="window.location.href=this.value;" style="font-size: 12px; padding: 4px;">
                                            <option value="">Change Status...</option>
                                            <option value="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=ajidhas-crm-leads&action=update_status&lead_id=' . $lead->id . '&status=new'), 'update_lead_' . $lead->id)); ?>">Mark as New</option>
                                            <option value="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=ajidhas-crm-leads&action=update_status&lead_id=' . $lead->id . '&status=contacted'), 'update_lead_' . $lead->id)); ?>">Mark Contacted</option>
                                            <option value="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=ajidhas-crm-leads&action=update_status&lead_id=' . $lead->id . '&status=in_progress'), 'update_lead_' . $lead->id)); ?>">In Progress</option>
                                            <option value="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=ajidhas-crm-leads&action=update_status&lead_id=' . $lead->id . '&status=closed'), 'update_lead_' . $lead->id)); ?>">Closed / Won</option>
                                        </select>
                                        <a href="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=ajidhas-crm-leads&action=delete_lead&lead_id=' . $lead->id), 'delete_lead_' . $lead->id)); ?>" onclick="return confirm('Are you sure you want to delete this lead?');" style="color: #ef4444; margin-left: 8px; text-decoration: none; font-size: 12px;">Delete</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }

    /**
     * Setup REST API Routes
     */
    public function register_rest_routes() {
        register_rest_route('ajidhas/v1', '/content', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_site_content'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route('ajidhas/v1', '/content', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_site_content_api'),
            'permission_callback' => function() {
                return current_user_can('edit_posts');
            },
        ));

        register_rest_route('ajidhas/v1', '/projects', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_projects_api'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route('ajidhas/v1', '/inquiry', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_inquiry_submission'),
            'permission_callback' => '__return_true',
            'args' => array(
                'name' => array('required' => true, 'sanitize_callback' => 'sanitize_text_field'),
                'email' => array('required' => true, 'sanitize_callback' => 'sanitize_email'),
                'message' => array('required' => true, 'sanitize_callback' => 'sanitize_textarea_field'),
            )
        ));

        register_rest_route('ajidhas/v1', '/inquiries', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_inquiries_api'),
            'permission_callback' => function() {
                return current_user_can('manage_options');
            },
        ));
    }

    public function get_site_content() {
        nocache_headers();
        $content = get_option($this->option_key, array());
        return rest_ensure_response(array('status' => 'success', 'data' => $content));
    }

    public function update_site_content_api(WP_REST_Request $request) {
        $params = $request->get_json_params();
        if (empty($params)) {
            return new WP_Error('empty_data', 'No content payload sent', array('status' => 400));
        }
        $existing = get_option($this->option_key, array());
        $updated = array_merge($existing, $params);
        update_option($this->option_key, $updated);
        return rest_ensure_response(array('status' => 'success', 'data' => $updated));
    }

    public function get_projects_api() {
        nocache_headers();
        $args = array(
            'post_type' => 'ajidhas_project',
            'posts_per_page' => -1,
            'post_status' => 'publish',
        );
        $query = new WP_Query($args);
        $projects = array();

        foreach ($query->posts as $post) {
            $thumbnail_id = get_post_thumbnail_id($post->ID);
            $thumbnail_url = $thumbnail_id ? wp_get_attachment_image_url($thumbnail_id, 'full') : '';

            $projects[] = array(
                'id' => $post->ID,
                'title' => $post->post_title,
                'description' => $post->post_excerpt ?: $post->post_content,
                'image' => $thumbnail_url,
                'category' => get_post_meta($post->ID, 'project_category', true) ?: 'Architecture',
                'bg_image' => get_post_meta($post->ID, 'project_bg_image', true) ?: '',
                'year' => get_post_meta($post->ID, 'project_year', true) ?: date('Y'),
                'location' => get_post_meta($post->ID, 'project_location', true) ?: '',
            );
        }

        return rest_ensure_response(array('status' => 'success', 'projects' => $projects));
    }

    public function handle_inquiry_submission(WP_REST_Request $request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ajidhas_inquiries';

        $name = sanitize_text_field($request->get_param('name'));
        $email = sanitize_email($request->get_param('email'));
        $phone = sanitize_text_field($request->get_param('phone') ?: '');
        $subject = sanitize_text_field($request->get_param('subject') ?: 'New Project Inquiry');
        $message = sanitize_textarea_field($request->get_param('message'));
        $type = sanitize_text_field($request->get_param('type') ?: 'general');

        if (!is_email($email)) {
            return new WP_Error('invalid_email', 'Please provide a valid email address.', array('status' => 400));
        }

        $inserted = $wpdb->insert(
            $table_name,
            array(
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'subject' => $subject,
                'message' => $message,
                'type' => $type,
                'status' => 'new',
            ),
            array('%s', '%s', '%s', '%s', '%s', '%s', '%s')
        );

        if (!$inserted) {
            return new WP_Error('db_error', 'Could not save inquiry lead.', array('status' => 500));
        }

        $lead_id = $wpdb->insert_id;

        $admin_email = get_option('admin_email');
        $email_subject = "[New Lead #$lead_id] $subject — $name";
        $email_body = "You have received a new inquiry from your website CRM:\n\n";
        $email_body .= "Name: $name\n";
        $email_body .= "Email: $email\n";
        $email_body .= "Phone: $phone\n";
        $email_body .= "Type: $type\n";
        $email_body .= "Subject: $subject\n\n";
        $email_body .= "Message:\n$message\n\n";
        $email_body .= "---\nView and manage lead in WP Admin: " . admin_url('admin.php?page=ajidhas-crm-leads');

        wp_mail($admin_email, $email_subject, $email_body);

        $reply_subject = "Thank you for reaching out to Ajidhas & Associates";
        $reply_body = "Hello $name,\n\nThank you for contacting Ajidhas & Associates. We have received your inquiry regarding \"$subject\" and our team will get back to you within 1-2 business days.\n\nBest regards,\nAjidhas & Associates Studio\nChennai, India";
        wp_mail($email, $reply_subject, $reply_body);

        if (function_exists('FluentCrmApi')) {
            try {
                $subscriber_data = array(
                    'email' => $email,
                    'first_name' => $name,
                    'status' => 'subscribed',
                    'tags' => array('website-lead', $type . '-inquiry'),
                );
                FluentCrmApi('contacts')->createOrUpdate($subscriber_data);
            } catch (Exception $e) {
                error_log('FluentCRM Integration Error: ' . $e->getMessage());
            }
        }

        return rest_ensure_response(array(
            'status' => 'success',
            'message' => 'Thank you! Your inquiry has been submitted successfully.',
            'lead_id' => $lead_id
        ));
    }

    public function get_inquiries_api() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ajidhas_inquiries';
        $leads = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC");
        return rest_ensure_response(array('status' => 'success', 'leads' => $leads));
    }

    public function setup_cors_headers() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, Origin, X-Requested-With, Accept");
    }

    public function handle_cors_preflight($value) {
        $origin = get_http_origin();
        $allowed_origin = $origin ? $origin : '*';
        header("Access-Control-Allow-Origin: $allowed_origin");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, Origin, X-Requested-With, Accept");
        header("Access-Control-Allow-Credentials: true");
        return $value;
    }
}

// Initialize Plugin
Ajidhas_CRM_Content_Manager::get_instance();
