import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { Location } from '@prisma/client';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

/**
 * Controller for handling HTTP requests related to locations.
 * This controller provides CRUD operations for managing locations.
 */
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  /**
   * Creates a new location.
   *
   * @param {CreateLocationDto} createLocationDto - The data to create a new location.
   * @returns {Promise<Location>} The created location.
   */
  @Post()
  async create(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    return this.locationService.create(createLocationDto);
  }

  /**
   * Retrieves all locations with their hierarchical structure.
   *
   * @returns {Promise<Location[]>} An array of all locations.
   */
  @Get()
  async getAll(): Promise<Location[]> {
    return this.locationService.getAll();
  }

  /**
   * Retrieves a location by its location number.
   *
   * @param {string} locationNumber - The location number of the location to retrieve.
   * @returns {Promise<Location>} The location with the given location number.
   */
  @Get(':locationNumber')
  async getByLocationNumber(
    @Param('locationNumber') locationNumber: string,
  ): Promise<Location> {
    return this.locationService.getByLocationNumber(locationNumber);
  }

  /**
   * Updates an existing location.
   *
   * @param {string} id - The UUID of the location to update.
   * @param {UpdateLocationDto} updateLocationDto - The updated data for the location.
   * @returns {Promise<Location>} The updated location.
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    return this.locationService.update(id, updateLocationDto);
  }

  /**
   * Deletes all locations from the database.
   *
   * @returns {Promise<void>} A promise indicating the completion of the operation.
   */
  @Delete('delete-all')
  async deleteAll() {
    return this.locationService.deleteAll();
  }

  /**
   * Deletes a location by its UUID.
   *
   * @param {string} id - The UUID of the location to delete.
   * @returns {Promise<Location>} The deleted location.
   */
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Location> {
    return this.locationService.delete(id);
  }
}
