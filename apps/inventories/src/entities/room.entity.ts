import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RoomBlock } from './room-block.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  roomNumber: string;

  @Column()
  type: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => RoomBlock, (roomBlock) => roomBlock.room)
  blocks: RoomBlock[];
}
