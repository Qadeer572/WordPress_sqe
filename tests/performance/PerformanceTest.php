<?php
use PHPUnit\Framework\TestCase;

class PerformanceTest extends TestCase
{
    // Set maximum acceptable response time in seconds
    private $maxResponseTime = 1.5;

    private $pages = [
        'http://localhost:8080/',
        'http://localhost:8080/wp-admin/',
        'http://localhost:8080/wp-admin/post-new.php',
        'http://localhost:8080/wp-admin/edit.php',
        'http://localhost:8080/wp-admin/edit-tags.php?taxonomy=category',
        'http://localhost:8080/wp-admin/edit-tags.php?taxonomy=post_tag',
        'http://localhost:8080/wp-admin/upload.php',
        'http://localhost:8080/wp-admin/options-general.php',
        'http://localhost:8080/wp-admin/options-writing.php',
        'http://localhost:8080/wp-admin/options-reading.php',
        'http://localhost:8080/wp-admin/options-discussion.php',
        'http://localhost:8080/wp-admin/options-media.php',
        'http://localhost:8080/wp-admin/options-permalink.php',
        'http://localhost:8080/wp-admin/options-privacy.php',
        'http://localhost:8080/wp-admin/options-security.php'
    ];

    public function testPageResponseTimes()
    {
        foreach ($this->pages as $page) {
            $start = microtime(true);
            $content = file_get_contents($page);
            $duration = microtime(true) - $start;
            
            $this->assertLessThan(
                $this->maxResponseTime,
                $duration,
                "Page $page took too long: $duration seconds"
            );
        }
    }
}
