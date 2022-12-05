using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AZChat.Data.Models;

public class RefreshToken
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public string Token { get; set; }

    public string JwtId { get; set; }

    public DateTime CreatedOn { get; set; }

    public DateTime ExpiresOn { get; set; }

    public bool Used { get; set; }

    public bool Invalidated { get; set; }

    public string UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; }
}