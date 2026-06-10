<?php

namespace App\Enums;

enum UserRole: string
{
    case Citizen = 'citizen';
    case Moderator = 'moderator';
    case Authority = 'authority';

    /** Roles con permiso para moderar reportes. */
    public function canModerate(): bool
    {
        return $this === self::Moderator || $this === self::Authority;
    }

    public function label(): string
    {
        return match ($this) {
            self::Citizen => 'Ciudadano',
            self::Moderator => 'Moderador',
            self::Authority => 'Autoridad',
        };
    }
}
