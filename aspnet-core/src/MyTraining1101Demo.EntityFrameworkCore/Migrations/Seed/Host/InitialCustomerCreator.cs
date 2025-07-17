using MyTraining1101Demo.Customers_Details;
using MyTraining1101Demo.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MyTraining1101Demo.Migrations.Seed.Host
{
    public class InitialCustomerCreator
    {
        private readonly MyTraining1101DemoDbContext _context;

        public InitialCustomerCreator(MyTraining1101DemoDbContext context)
        {
            _context = context;
        }

        public void Create()
        {
            CreateCustomers();
        }

        private void CreateCustomers()
        {
            if (_context.Customers.Any(c => c.Email == "customer1@example.com"))
            {
                return;
            }

            _context.Customers.Add(
                new Customer
                {
                    Name = "John Doe",
                    Email = "customer1@example.com",
                    Address = "123 Elm Street, Springfield",
                    RegistrationDate = DateTime.Now
                });

            _context.Customers.Add(
                new Customer
                {
                    Name = "Jane Smith",
                    Email = "customer2@example.com",
                    Address = "456 Oak Avenue, Metropolis",
                    RegistrationDate = DateTime.Now
                });
        }
    }
}
