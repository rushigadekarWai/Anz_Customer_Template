using MyTraining1101Demo.customer_consts;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace MyTraining1101Demo.Customers_serv.DTO
{
    public class CreateCustomerInput
    {
        [Required]
        [MaxLength(CustomerConsts.MaxNameLength)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(CustomerConsts.MaxEmailLength)]
        public string Email { get; set; }

        [Required]
        [MaxLength(CustomerConsts.MaxAddressLength)]
        public string Address { get; set; }

        [Required]
        public DateTime RegistrationDate { get; set; }

        public List<long> UserIds { get; set; }
    }
}
