import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/contact.dto';
import { ContactMessage } from './entities/contact-message.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly messagesRepository: Repository<ContactMessage>,
  ) {}

  async create(dto: CreateContactDto) {
    if (!dto.consent) {
      throw new BadRequestException(
        'Necesitamos tu consentimiento para guardar el mensaje',
      );
    }

    const message = this.messagesRepository.create({
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      organization: dto.organization?.trim() ?? null,
      sector: dto.sector ?? null,
      message: dto.message.trim(),
      consent: true,
      read: false,
    });

    await this.messagesRepository.save(message);
    return { ok: true };
  }

  list() {
    return this.messagesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async markRead(id: string) {
    await this.messagesRepository.update(id, { read: true });
    return { ok: true };
  }

  countUnread() {
    return this.messagesRepository.count({ where: { read: false } });
  }
}
