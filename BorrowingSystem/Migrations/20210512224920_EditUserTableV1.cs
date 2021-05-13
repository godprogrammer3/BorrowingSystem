using Microsoft.EntityFrameworkCore.Migrations;

namespace BorrowingSystem.Migrations
{
    public partial class EditUserTableV1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Image",
                table: "User",
                newName: "ProfileImage");

            migrationBuilder.AddColumn<string>(
                name: "SerialNumber",
                table: "Equipment",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SerialNumber",
                table: "Equipment");

            migrationBuilder.RenameColumn(
                name: "ProfileImage",
                table: "User",
                newName: "Image");
        }
    }
}
