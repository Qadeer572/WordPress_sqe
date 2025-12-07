<?php
use PHPUnit\Framework\TestCase;

class PerformanceTest extends TestCase
{
    // Set maximum acceptable response time in seconds
    private $maxResponseTime = 1.5;

    private $baseUrl;
    
    public function __construct()
    {
        parent::__construct();
        // Use environment variable if set (for CI), otherwise default to localhost
        $this->baseUrl = getenv('WP_BASE_URL') ?: 'http://127.0.0.1:8080';
    }
    
    private function getPages()
    {
        return [
            $this->baseUrl . '/',
            $this->baseUrl . '/wp-admin/',
            $this->baseUrl . '/wp-admin/post-new.php',
            $this->baseUrl . '/wp-admin/edit.php',
            $this->baseUrl . '/wp-admin/edit-tags.php?taxonomy=category',
            $this->baseUrl . '/wp-admin/edit-tags.php?taxonomy=post_tag',
            $this->baseUrl . '/wp-admin/upload.php',
            $this->baseUrl . '/wp-admin/options-general.php',
            $this->baseUrl . '/wp-admin/options-writing.php',
            $this->baseUrl . '/wp-admin/options-reading.php',
            $this->baseUrl . '/wp-admin/options-discussion.php',
            $this->baseUrl . '/wp-admin/options-media.php',
            $this->baseUrl . '/wp-admin/options-permalink.php',
            $this->baseUrl . '/wp-admin/options-privacy.php',
            $this->baseUrl . '/wp-admin/options-security.php'
        ];
    }

    public function testPageResponseTimes()
    {
        $pages = $this->getPages();
        foreach ($pages as $page) {
            $start = microtime(true);
            $context = stream_context_create([
                'http' => [
                    'timeout' => 10,
                    'ignore_errors' => true
                ]
            ]);
            $content = @file_get_contents($page, false, $context);
            $duration = microtime(true) - $start;
            
            // Only assert if page was accessible
            if ($content !== false) {
                $this->assertLessThan(
                    $this->maxResponseTime,
                    $duration,
                    "Page $page took too long: $duration seconds"
                );
            } else {
                $this->markTestSkipped("Page $page is not accessible (WordPress may not be running)");
            }
        }
    }
}
