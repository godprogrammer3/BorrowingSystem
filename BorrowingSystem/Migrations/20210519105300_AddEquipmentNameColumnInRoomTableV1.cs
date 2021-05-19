using Microsoft.EntityFrameworkCore.Migrations;

namespace BorrowingSystem.Migrations
{
    public partial class AddEquipmentNameColumnInRoomTableV1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EquipmentName",
                table: "Room",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EquipmentName",
                table: "Room");
        }
    }
}
