import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object (DTO) for updating an existing location.
 * This DTO is used to validate the incoming request payload when a location is being updated.
 */
export class UpdateLocationDto {
  /**
   * The updated name of the location.
   *
   * @example "Headquarters"
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  locationName: string;

  /**
   * The updated unique identifier for the location, typically formatted with hyphens.
   *
   * @example "LOC-002"
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  locationNumber: string;
}
