import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object (DTO) for creating a new location.
 * This DTO is used to validate the incoming request payload when a new location is being created.
 */
export class CreateLocationDto {
  /**
   * The name of the location.
   *
   * @example "Main Office"
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  locationName: string;

  /**
   * The unique identifier for the location, typically formatted with hyphens.
   *
   * @example "LOC-001"
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  locationNumber: string;
}
