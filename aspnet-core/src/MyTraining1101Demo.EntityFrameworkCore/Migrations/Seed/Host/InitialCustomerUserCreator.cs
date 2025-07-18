using MyTraining1101Demo.Customers_Details;
using MyTraining1101Demo.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MyTraining1101Demo.Migrations.Seed.Host
{
    public class InitialCustomerUserCreator
    {
        private readonly MyTraining1101DemoDbContext _context;

        public InitialCustomerUserCreator(MyTraining1101DemoDbContext context)
        {
            _context = context;
        }

        public void Create()
        {
            if (_context.CustomerUsers.Any())
                return;

            var customer1 = _context.Customers.FirstOrDefault(c => c.Email == "customer1@example.com");
            var customer2 = _context.Customers.FirstOrDefault(c => c.Email == "customer2@example.com");

            var user1 = _context.Users.FirstOrDefault(u => u.UserName == "johnuser");
            var user2 = _context.Users.FirstOrDefault(u => u.UserName == "janeuser");

            if (customer1 != null && user1 != null)
            {
                _context.CustomerUsers.Add(new CustomerUser
                {
                    CustomerId = customer1.Id,
                    UserId = user1.Id,
                    CreationTime = DateTime.Now
                });
            }

            if (customer2 != null && user2 != null)
            {
                _context.CustomerUsers.Add(new CustomerUser
                {
                    CustomerId = customer2.Id,
                    UserId = user2.Id,
                    CreationTime = DateTime.Now
                });
            }

            _context.SaveChanges();
        }
    }

}
