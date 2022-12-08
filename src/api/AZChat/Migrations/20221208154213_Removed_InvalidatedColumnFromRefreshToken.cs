using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AZChat.Migrations
{
    /// <inheritdoc />
    public partial class RemovedInvalidatedColumnFromRefreshToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Invalidated",
                table: "RefreshTokens");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Invalidated",
                table: "RefreshTokens",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }
    }
}
