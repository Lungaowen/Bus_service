using System;

namespace TshwaneBusTicketingSystem
{
    public class VirtualCard
    {
        public string CardNumber { get; set; }
        public string CardHolderName { get; set; }
        public string ExpiryDate { get; set; }
        public string CVV { get; set; }

        public VirtualCard(string cardNumber, string holderName,
                           string expiryDate, string cvv)
        {
            CardNumber = cardNumber;
            CardHolderName = holderName;
            ExpiryDate = expiryDate;
            CVV = cvv;
        }

        public bool Validate()
        {
            if (CardNumber.Length != 16)
            {
                Console.WriteLine("Card number must contain exactly 16 digits.");
                return false;
            }

            foreach (char c in CardNumber)
            {
                if (!char.IsDigit(c))
                {
                    Console.WriteLine("Card number must contain digits only.");
                    return false;
                }
            }

            if (CVV.Length != 3)
            {
                Console.WriteLine("CVV must contain exactly 3 digits.");
                return false;
            }

            foreach (char c in CVV)
            {
                if (!char.IsDigit(c))
                {
                    Console.WriteLine("CVV must contain digits only.");
                    return false;
                }
            }

            if (string.IsNullOrWhiteSpace(CardHolderName))
            {
                Console.WriteLine("Card holder name cannot be empty.");
                return false;
            }

            return true;
        }

        public string GetMaskedCard()
        {
            return "************" + CardNumber.Substring(12);
        }
    }
}