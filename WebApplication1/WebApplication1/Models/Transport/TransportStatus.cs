namespace WebApplication1.Models.Transport;

public enum TransportStatus
{
    BookingConfirmed = 1,
    PickupScheduled = 2,
    Loading = 3,
    InTransit = 4,
    AtIntermediateStop = 5,
    DeliveryScheduled = 6,
    Unloading = 7,
    Delivered = 8,
    Completed = 9,
    Exception = 10,
    Canceled = 11
}