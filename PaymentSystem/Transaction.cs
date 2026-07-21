using System;

namespace TshwaneBusTicketingSystem
{
    public class Transaction
    {
        public string Reference { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; }
        public string Status { get; set; }
        public DateTime Date { get; set; }
        public string Type { get; set; }

        public Transaction(decimal amount)
        {
            Reference = "TXN" + DateTime.Now.ToString("yyyyMMddHHmmss");
            Type = "Top-Up";
            Amount = amount;
            PaymentMethod = "Virtual Card";
            Status = "Successful";
            Date = DateTime.Now;
        }

        public Transaction(string type, decimal amount)
        {
            Reference = "TXN" + DateTime.Now.ToString("yyyyMMddHHmmss");
            Type = type;
            Amount = amount;
            PaymentMethod = "Virtual Card";
            Status = "Successful";
            Date = DateTime.Now;
        }

        public void PrintReceipt(string maskedCard)
        {
            Console.WriteLine();
            Console.WriteLine("=====================================");
            Console.WriteLine("      TSHWANE BUS TICKETING");
            Console.WriteLine("=====================================");

            Console.WriteLine("Payment Status : " + Status);
            Console.WriteLine("Reference      : " + Reference);
            Console.WriteLine("Card Used      : " + maskedCard);
            Console.WriteLine("Amount Paid    : R" + Amount);
            Console.WriteLine("Payment Method : " + PaymentMethod);
            Console.WriteLine("Date           : " + Date);

            Console.WriteLine("=====================================");
            Console.WriteLine("Thank you for your payment.");
            Console.WriteLine("=====================================");
        }
    }
}