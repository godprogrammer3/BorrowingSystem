using Microsoft.EntityFrameworkCore.Migrations;

namespace BorrowingSystem.Migrations
{
    public partial class ChangeEquipmentIdToRoomIdInReservationTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EquipmentId",
                table: "Reservation",
                newName: "RoomId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RoomId",
                table: "Reservation",
                newName: "EquipmentId");
        }
    }
}
