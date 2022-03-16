using MediatR;
using Domain;
using System.Threading.Tasks;
using System.Threading;
using Persistence;
using AutoMapper;//update all params(mapping function)
using FluentValidation;
using Application.core;

namespace Application.Activities
{
    public class Edit
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Activity Activity { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Activity).SetValidator(new ActivityValidator());
            }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly IMapper _mapper;

            private readonly DataContext _context;
            public Handler(DataContext context, IMapper mapper)
            {
                _mapper = mapper;
                _context = context;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await _context.Activities.FindAsync(request.Activity.Id);

                if (activity == null)

                    return null;

                _mapper.Map(request.Activity, activity); //update all params

                var result = await _context.SaveChangesAsync() > 0;

                if (result) return Result<Unit>.Failure("Activity Updated");

                if (!result) return Result<Unit>.Failure("Failed to Update Activity");

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}