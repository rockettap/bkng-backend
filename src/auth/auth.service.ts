import { Injectable } from '@nestjs/common';
import { Profile } from 'passport-google-oauth20';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateGoogleLogin(profile: Profile): Promise<User> {
    const user = await this.usersService.findBySub(profile.id);
    if (!user) {
      const newUser = await this.usersService.create(
        User.createWithGoogle(0, profile.id),
      );
      return newUser;
    }
    return user;
  }
}
