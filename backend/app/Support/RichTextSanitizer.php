<?php

namespace App\Support;

class RichTextSanitizer
{
    private const ALLOWED_TAGS = '<p><br><strong><b><em><i><u><ul><ol><li><a><div>';

    public static function clean(?string $value): string
    {
        $html = trim((string) $value);

        if ($html === '') {
            return '';
        }

        $html = strip_tags($html, self::ALLOWED_TAGS);
        $html = preg_replace('/\s+on[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $html) ?? $html;
        $html = preg_replace('/\s+style\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $html) ?? $html;
        $html = preg_replace('/\s+href\s*=\s*([\'"])\s*(?!https?:\/\/|mailto:|tel:|#)(.*?)\1/i', '', $html) ?? $html;
        $html = preg_replace('/\s+href\s*=\s*(?![\'"])(?!https?:\/\/|mailto:|tel:|#)[^\s>]+/i', '', $html) ?? $html;
        $html = preg_replace('/<(script|iframe|object|embed|form|input|button|textarea)[^>]*>.*?<\/\1>/is', '', $html) ?? $html;

        return trim($html);
    }
}
