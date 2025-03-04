using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    public class MessageHub : Hub
    {
        private readonly IMapper _mapper;
        private readonly PresenceTracker _trackeur;
        private readonly IHubContext<PresenceHub> _presenceHub;
        private readonly IUnitOfWork _unitOfWork;


        public MessageHub(IUnitOfWork unitOfWork,
        IMapper mapper, IUserRepository userRepository,
        IHubContext<PresenceHub> presenceHub,
        PresenceTracker tracker)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _presenceHub = presenceHub;
            _trackeur = tracker;
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var otherUser = httpContext?.Request.Query["user"].ToString();
            var groupName = GetGroupName(Context.User.GetUserName(), otherUser);

            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            var group = await AddToGroup(groupName);

            await Clients.Group(groupName).SendAsync("UpdatedGroup", group);

            var messages = await _unitOfWork.MessageRepository
                .GetMessageThread(Context.User.GetUserName(), otherUser);

            if (_unitOfWork.HasChanges())
            {
                await _unitOfWork.Complete();
            }

            await Clients.Caller.SendAsync("ReceiveMessageThread", messages);
        }
        
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var group = await RemoveFromMessageGroup();
            await Clients.Group(group.Name).SendAsync("UpdatedGroup", group);
            await base.OnDisconnectedAsync(exception);
        }

         public async Task SendMessage(CreateMessageDto createMessageDto)
        {
            var username = Context.User.GetUserName() ?? throw new Exception("could not get user");

            if (username == createMessageDto.RecipientUsername.ToLower())
                throw new HubException("You cannot message yourself");
            
            var sender = await _unitOfWork.UserRepository.GetUserByUsernameAsync(username);
            var recipient = await _unitOfWork.UserRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);

            if (recipient == null || sender == null || sender.UserName == null || recipient.UserName == null) 
                throw new HubException("Cannot send message at this time");

            var message = new Message
            {
                Sender = sender,
                Recipient = recipient,
                SenderUsername = sender.UserName,
                RecipientUsername = recipient.UserName,
                Content = createMessageDto.Content
            };

             var groupName = GetGroupName(sender.UserName, recipient.UserName);
             var group = await _unitOfWork.MessageRepository.GetMessageGroup(groupName);

            if (group != null && group.Connections.Any(x => x.Username == recipient.UserName))
            {
                message.DateRead = DateTime.UtcNow;
            } 
            else 
            {
                var connections = await _trackeur.GetConnectionsForUser(recipient.UserName);
                if (connections != null)
                {
                    await _presenceHub.Clients
                        .Clients(connections)
                        .SendAsync("NewMessageReceived", 
                            new {username = sender.UserName, knownAs = sender.KnownAs});
                }
            }

            _unitOfWork.MessageRepository.AddMessage(message);

            if (await _unitOfWork.Complete())
            {
               await Clients.Group(groupName)
                .SendAsync("NewMessage", _mapper.Map<MessageDto>(message));
            }
        }

        private async Task<Group> AddToGroup(string groupName)
        {
            var username = Context.User.GetUserName() 
                ?? throw new Exception("Cannot get username");

            var group = await _unitOfWork.MessageRepository.GetMessageGroup(groupName);
            var connection = new Connection {
                        ConnectionId = Context.ConnectionId, 
                        Username = username
                        };

            if (group == null)
            {
                group = new Group{Name = groupName};
                _unitOfWork.MessageRepository.AddGroup(group);
            }

            group.Connections.Add(connection);

            if (await _unitOfWork.Complete()) return group;

            throw new HubException("Failed to join group");
        }

        private async Task<Group> RemoveFromMessageGroup() 
        {
            var group = await _unitOfWork.MessageRepository
                .GetGroupForConnection(Context.ConnectionId);
            var connection = group?.Connections
                .FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
            
            if (connection != null && group != null)
            {
                _unitOfWork.MessageRepository.RemoveConnection(connection);
                if (await _unitOfWork.Complete()) return group;
            }

            throw new Exception("Failed to remove from group");
        }

        private string GetGroupName(string caller, string other) 
        {
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
        }
    }
}