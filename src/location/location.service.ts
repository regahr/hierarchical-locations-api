import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Location } from '@prisma/client';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

/**
 * Service responsible for handling location-related operations.
 */
@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new location and auto-detects the parent location ID based on the provided location number.
   *
   * @param {CreateLocationDto} data - The data to create a new location.
   * @returns {Promise<Location>} The created location.
   */
  async create(data: CreateLocationDto): Promise<Location> {
    const { locationName, locationNumber } = data;

    // Auto-detect the building
    const building = locationNumber.includes('-')
      ? locationNumber.substring(0, locationNumber.indexOf('-'))
      : locationNumber;

    // Auto-detect the parentLocationId
    const parentLocationId = await this.detectParentLocationId(locationNumber);

    return this.prisma.location.create({
      data: {
        locationName,
        locationNumber,
        parentLocationId,
        building: building || 'UNKNOWN',
      },
    });
  }

  /**
   * Retrieves all top-level locations and their child locations recursively.
   *
   * @returns {Promise<Location[]>} An array of all locations with their hierarchical structure.
   */
  async getAll(): Promise<Location[]> {
    const locations = await this.prisma.location.findMany({
      where: {
        parentLocationId: null,
      },
    });
    // Fetch child locations recursively
    const locationsWithChildren = await Promise.all(
      locations.map(async (location) => {
        return this.getLocationWithChildren(location.id);
      }),
    );

    return locationsWithChildren;
  }

  /**
   * Retrieves a location by its location number, including its child locations recursively.
   *
   * @param {string} locationNumber - The location number to search for.
   * @returns {Promise<Location>} The found location, or an exception if not found.
   */
  async getByLocationNumber(locationNumber: string): Promise<Location> {
    const location = await this.prisma.location.findUnique({
      where: { locationNumber },
      include: {
        childLocations: {
          include: {
            childLocations: true, // Nested child locations
          },
        },
      },
    });

    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  /**
   * Updates an existing location and auto-detects the parent location ID based on the updated location number.
   * Saves the current version before applying the update.
   *
   * @param {string} id - The UUID of the location to update.
   * @param {UpdateLocationDto} data - The updated data for the location.
   * @returns {Promise<Location>} The updated location.
   */
  async update(id: string, data: UpdateLocationDto): Promise<Location> {
    const { locationName, locationNumber } = data;

    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    // Save current version before update
    await this.prisma.locationVersion.create({
      data: {
        locationId: location.id,
        versionNumber: await this.getNextVersionNumber(location.id),
        building: location.building,
        locationName: location.locationName,
        locationNumber: location.locationNumber,
        parentLocationId: location.parentLocationId,
      },
    });

    // Auto-detect the building
    const building = locationNumber.includes('-')
      ? locationNumber.substring(0, locationNumber.indexOf('-'))
      : locationNumber;

    // Auto-detect the parentLocationId
    const parentLocationId = await this.detectParentLocationId(locationNumber);

    return this.prisma.location.update({
      where: { id },
      data: {
        locationName,
        locationNumber,
        parentLocationId,
        building,
      },
    });
  }

  /**
   * Deletes a location and its child locations recursively.
   *
   * @param {string} id - The UUID of the location to delete.
   * @returns {Promise<Location>} The deleted location.
   */
  async delete(id: string): Promise<Location> {
    await this.prisma.location.deleteMany({
      where: { parentLocationId: id },
    });
    return this.prisma.location.delete({ where: { id } });
  }

  /**
   * Deletes all locations in the database.
   *
   * @returns {Promise<void>} A promise indicating the completion of the operation.
   */
  async deleteAll() {
    return this.prisma.location.deleteMany({});
  }

  /**
   * Recursively fetches a location and its child locations.
   *
   * @param {string} id - The UUID of the location to fetch.
   * @returns {Promise<any>} The location with its child locations.
   * @private
   */
  private async getLocationWithChildren(id: string): Promise<any> {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        childLocations: true,
      },
    });

    if (!location) {
      return null;
    }

    // Recursively fetch child locations
    const childLocations = await Promise.all(
      location.childLocations.map(async (child) => {
        return this.getLocationWithChildren(child.id);
      }),
    );

    return {
      ...location,
      childLocations,
    };
  }

  /**
   * Auto-detects the parent location ID based on the location number.
   * If the parent location is not found, throws an exception with guidance on how to fill the location number.
   *
   * @param {string} locationNumber - The location number to determine the parent location.
   * @returns {Promise<string | null>} The UUID of the parent location, or null if it is a top-level location.
   * @private
   */
  private async detectParentLocationId(
    locationNumber: string,
  ): Promise<string | null> {
    // Extract parent location number by removing the last segment after the last '-'
    const parentLocationNumber = locationNumber.includes('-')
      ? locationNumber.substring(0, locationNumber.lastIndexOf('-'))
      : null;

    if (parentLocationNumber) {
      const parentLocation = await this.prisma.location.findUnique({
        where: { locationNumber: parentLocationNumber },
      });

      if (!parentLocation) {
        // Fetch available parent locations
        const availableParentLocations = await this.prisma.location.findMany({
          select: {
            locationName: true,
            locationNumber: true,
          },
        });
        throw new NotFoundException({
          message:
            'Parent location not found. Please ensure the parent location exists and that the location number follows the correct format: e.g., "A-01-01" where "A-01" should already exist.',
          availableParentLocations,
        });
      }

      return parentLocation.id;
    }

    return null; // No parent location, this is a top-level location
  }

  /**
   * Retrieves the next version number for a location.
   *
   * @param {string} locationId - The UUID of the location.
   * @returns {Promise<number>} The next version number.
   * @private
   */
  private async getNextVersionNumber(locationId: string): Promise<number> {
    const latestVersion = await this.prisma.locationVersion.findFirst({
      where: { locationId },
      orderBy: { versionNumber: 'desc' },
    });
    return latestVersion ? latestVersion.versionNumber + 1 : 1;
  }
}
