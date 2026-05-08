import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
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
  isSearching: boolean = false;

  // Simple status message shown after an action
  statusMessage: string = '';
  statusIsError: boolean = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Show whatever is already saved immediately
    this.friends = this.currentUser.friends || [];
    this.friendRequests = this.currentUser.friendRequests || [];

    // Then refresh from the backend so friends/requests are fully up to date
    this.refreshCurrentUser();
    this.loadAllUsers();
  }

  // ─── Data Loading ────────────────────────────────────────────────────────────

  // Re-fetch the current user from the backend so friends/requests stay in sync
  refreshCurrentUser(): void {
    this.authService.refreshCurrentUser().subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;

        // Update the visible friends/request arrays immediately
        this.friends = updatedUser.friends || [];
        this.friendRequests = updatedUser.friendRequests || [];

        // Save latest user in local storage/session
        this.authService.saveUser(updatedUser);

        // Force Angular to refresh the page display
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error refreshing current user:', err);
      }
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

      return (
        (nameMatch || emailMatch) &&
        !this.isFriend(u._id) &&
        !this.hasIncomingRequest(u._id)
      );
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
        this.searchQuery = ''; // clear search so the result disappears

        // Refresh the users list after sending a request
        this.loadAllUsers();
        this.cdr.detectChanges();
      },
      error: (err) => this.showMessage(err.error?.message || 'Could not send request.', true),
    });
  }

  acceptRequest(senderId: string): void {
    this.userService.acceptFriendRequest(this.currentUser._id, senderId).subscribe({
      next: () => {
        this.showMessage('Friend added!');
        this.refreshCurrentUser();
        this.loadAllUsers();
      },
      error: (err) => this.showMessage(err.error?.message || 'Could not accept request.', true),
    });
  }

  declineRequest(senderId: string): void {
    this.userService.declineFriendRequest(this.currentUser._id, senderId).subscribe({
      next: () => {
        this.showMessage('Request declined.');
        this.refreshCurrentUser();
      },
      error: (err) => this.showMessage(err.error?.message || 'Could not decline request.', true),
    });
  }

  removeFriend(friendId: string): void {
    const confirmed = window.confirm('Are you sure you want to remove this friend?');
    if (!confirmed) return;

    this.userService.removeFriend(this.currentUser._id, friendId).subscribe({
      next: () => {
        this.showMessage('Friend removed.');
        this.refreshCurrentUser();
        this.loadAllUsers();
      },
      error: (err) => this.showMessage(err.error?.message || 'Could not remove friend.', true),
    });
  }

  // ─── UI helpers ──────────────────────────────────────────────────────────────

  toggleSearch(): void {
    this.isSearching = !this.isSearching;
    if (!this.isSearching) {
      this.searchQuery = '';
    }
  }

  private showMessage(msg: string, isError = false): void {
    this.statusMessage = msg;
    this.statusIsError = isError;

    // Auto-clear after 3 seconds
    setTimeout(() => {
      this.statusMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }
}