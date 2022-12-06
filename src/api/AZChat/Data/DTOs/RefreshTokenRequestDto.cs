﻿using System.ComponentModel.DataAnnotations;

namespace AZChat.Data.DTOs;

public class RefreshTokenRequestDto
{
    [Required]
    public string Token { get; set; }

    [Required]
    public string RefreshToken { get; set; }
}