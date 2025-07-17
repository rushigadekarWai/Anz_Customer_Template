using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MyTraining1101Demo.Customers_Details
{
    [Table("PbCustomers")]
    public class Customer : FullAuditedEntity
    {
        public const int MaxNameLength = 150;
        public const int MaxEmailLength = 150;
        public const int MaxAddressLength = 250;

        [Required]
        [MaxLength(MaxNameLength)]
        public virtual string Name { get; set; }

        [MaxLength(MaxEmailLength)]
        public virtual string Email { get; set; }

        [MaxLength(MaxAddressLength)]
        public virtual string Address { get; set; }

        [Required]
        public virtual DateTime RegistrationDate { get; set; }
    }
}
