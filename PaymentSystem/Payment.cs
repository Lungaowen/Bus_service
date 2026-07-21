using System.Collections.Generic;
using TshwaneBusTicketingSystem;

public class PaymentService
{
    private readonly List<Transaction> history = new();

    public Transaction? ProcessPayment(VirtualCard card, decimal amount)
    {
        if (!card.Validate())
            return null;

        Transaction t = new Transaction("Top-Up", amount);
        history.Add(t);
        return t;
    }

    public Transaction Refund(decimal amount)
    {
        Transaction t = new Transaction("Refund", amount);
        history.Add(t);
        return t;
    }

    public List<Transaction> GetHistory()
    {
        return history;
    }

    public VirtualCard? ChangeCard()
    {
        Console.WriteLine("\n===== CHANGE PAYMENT CARD =====");

        Console.Write("New Card Number (16 digits): ");
        string? cardNumber = Console.ReadLine();

        Console.Write("Card Holder Name: ");
        string? holderName = Console.ReadLine();

        Console.Write("Expiry Date (MM/YY): ");
        string? expiry = Console.ReadLine();

        Console.Write("CVV: ");
        string? cvv = Console.ReadLine();

        VirtualCard newCard = new VirtualCard(
            cardNumber ?? string.Empty,
            holderName ?? string.Empty,
            expiry ?? string.Empty,
            cvv ?? string.Empty);

        if (newCard.Validate())
        {
            Console.WriteLine("\nPayment card updated successfully.");
            Console.WriteLine("Current Card: " + newCard.GetMaskedCard());
            return newCard;
        }

        Console.WriteLine("Card update failed.");
        return null;
    }
}