import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-friends',
  standalone: false,
  templateUrl: './friends.html',
  styleUrl: './friends.css',
})
export class Friends implements OnInit {
  currentUser: any = null;

  // These arrays come back populated from the backend (username + email included)
  friends: any[] = [];
  friendRequests: any[] = [];

  // All users in the DB, filtered down by the search box
  allUsers: any[] = [];
  searchQuery: string = '';

  // Simple status message shown after an action
  statusMessage: string = '';
  statusIsError: boolean = false;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.refreshCurrentUser();
      this.loadAllUsers();
    }
  }

  // ─── Data Loading ────────────────────────────────────────────────────────────

  // Re-fetch the current user from the backend so friends/requests stay in sync
  refreshCurrentUser(): void {
    this.userService.getUserById(this.currentUser._id).subscribe({
      next: (user) => {
        this.friends = user.friends || [];
        this.friendRequests = user.friendRequests || [];
      },
      error: () => this.showMessage('Could not load your friends list.', true),
    });
  }

  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        // Exclude yourself from the list
        this.allUsers = users.filter((u) => u._id !== this.currentUser._id);
      },
      error: () => this.showMessage('Could not load user list.', true),
    });
  }

  // ─── Computed / helper getters ────────────────────────────────────────────────

  // Only show search results when the user has typed something
  get searchResults(): any[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return [];

    return this.allUsers.filter((u) => {
      const nameMatch = u.username.toLowerCase().includes(q);
      const emailMatch = u.email.toLowerCase().includes(q);
      return (nameMatch || emailMatch) && !this.isFriend(u._id) && !this.hasIncomingRequest(u._id);
    });
  }

  isFriend(userId: string): boolean {
    return this.friends.some((f) => this.getId(f) === userId);
  }

  // Does this person have an *incoming* request from userId already stored on us?
  hasIncomingRequest(userId: string): boolean {
    return this.friendRequests.some((r) => this.getId(r) === userId);
  }

  // Mongoose's .populate() returns objects; a plain array stores ObjectId strings
  private getId(val: any): string {
    return typeof val === 'object' ? val._id : val;
  }

  // ─── Actions ─────────────────────────────────────────────────────────────────

  sendRequest(receiverId: string): void {
    this.userService.sendFriendRequest(receiverId, this.currentUser._id).subscribe({
      next: () => {
        this.showMessage('Friend request sent!');
        this.searchQuery = '';   // clear search so the result disappears
      },
      error: (err) => this.showMessage(err.error?.message || 'Could not send request.', true),
    });
  }

  acceptRequest(senderId: string): void {
    this.userService.acceptFriendRequest(this.currentUser._id, senderId).subscribe({
      next: () => {
        this.showMessage('Friend added!');
        this.refreshCurrentUser();
      },
      error: (err) => this.showMessage(err.error?.message || 'Could not accept request.', true),
    });
  }

  declineRequest(senderId: string): void {
    // "Declining" = just remove the request from the receiver's friendRequests array.
    // The backend's removeFriend endpoint removes from the friends list, not requests,
    // so we need to handle this with a plain updateUser call or a dedicated route.
    // For now we optimistically remove it locally and refresh.
    // If you add a dedicated decline route later, swap in the HTTP call here.
    this.friendRequests = this.friendRequests.filter(
      (r) => this.getId(r) !== senderId
    );
    this.showMessage('Request declined.');
  }

  removeFriend(friendId: string): void {
    this.userService.removeFriend(this.currentUser._id, friendId).subscribe({
      next: () => {
        this.showMessage('Friend removed.');
        this.refreshCurrentUser();
      },
      error: (err) => this.showMessage(err.error?.message || 'Could not remove friend.', true),
    });
  }

  // ─── UI helpers ──────────────────────────────────────────────────────────────

  private showMessage(msg: string, isError = false): void {
    this.statusMessage = msg;
    this.statusIsError = isError;
    // Auto-clear after 3 seconds
    setTimeout(() => (this.statusMessage = ''), 3000);
  }
}