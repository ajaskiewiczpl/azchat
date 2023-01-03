﻿using System.ComponentModel.DataAnnotations;

namespace AZChat.Data.DTOs;

public class DeleteUsersRequestDto
{
    [Required]
    public List<string> UserIDs { get; set; } = new();

    public string? SignalRConnectionID { get; set; }
}