import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// Validation helper functions
function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.includes('-');
}

function isValidAge(age: number): boolean {
  return Number.isInteger(age) && age > 0 && age <= 150;
}

function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function isValidCountryCode(countryCode: string): boolean {
  const countryCodeRegex = /^\+\d{1,4}$/;
  return countryCodeRegex.test(countryCode);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const profile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ 
        error: 'Profile not found',
        code: 'PROFILE_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(profile[0]);
  } catch (error) {
    console.error('GET profile error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { age, dateOfBirth, phone, countryCode, country, state, city } = requestBody;

    // Validation
    if (age !== undefined && !isValidAge(age)) {
      return NextResponse.json({ 
        error: "Age must be a positive integer between 1 and 150",
        code: "INVALID_AGE" 
      }, { status: 400 });
    }

    if (dateOfBirth && !isValidDateString(dateOfBirth)) {
      return NextResponse.json({ 
        error: "Date of birth must be a valid ISO date string",
        code: "INVALID_DATE_OF_BIRTH" 
      }, { status: 400 });
    }

    if (phone && !isValidPhoneNumber(phone)) {
      return NextResponse.json({ 
        error: "Phone number format is invalid",
        code: "INVALID_PHONE" 
      }, { status: 400 });
    }

    if (countryCode && !isValidCountryCode(countryCode)) {
      return NextResponse.json({ 
        error: "Country code must be in format +XX",
        code: "INVALID_COUNTRY_CODE" 
      }, { status: 400 });
    }

    // Check if profile exists
    const existingProfile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    const now = new Date().toISOString();

    if (existingProfile.length > 0) {
      // Update existing profile
      const updated = await db.update(userProfiles)
        .set({
          ...(age !== undefined && { age }),
          ...(dateOfBirth && { dateOfBirth }),
          ...(phone && { phone }),
          ...(countryCode && { countryCode }),
          ...(country && { country }),
          ...(state && { state }),
          ...(city && { city }),
          updatedAt: now
        })
        .where(eq(userProfiles.userId, user.id))
        .returning();

      return NextResponse.json(updated[0]);
    } else {
      // Create new profile
      const newProfile = await db.insert(userProfiles)
        .values({
          userId: user.id,
          age: age || null,
          dateOfBirth: dateOfBirth || null,
          phone: phone || null,
          countryCode: countryCode || null,
          country: country || null,
          state: state || null,
          city: city || null,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      return NextResponse.json(newProfile[0], { status: 201 });
    }
  } catch (error) {
    console.error('POST profile error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { age, dateOfBirth, phone, countryCode, country, state, city } = requestBody;

    // Validation
    if (age !== undefined && !isValidAge(age)) {
      return NextResponse.json({ 
        error: "Age must be a positive integer between 1 and 150",
        code: "INVALID_AGE" 
      }, { status: 400 });
    }

    if (dateOfBirth && !isValidDateString(dateOfBirth)) {
      return NextResponse.json({ 
        error: "Date of birth must be a valid ISO date string",
        code: "INVALID_DATE_OF_BIRTH" 
      }, { status: 400 });
    }

    if (phone && !isValidPhoneNumber(phone)) {
      return NextResponse.json({ 
        error: "Phone number format is invalid",
        code: "INVALID_PHONE" 
      }, { status: 400 });
    }

    if (countryCode && !isValidCountryCode(countryCode)) {
      return NextResponse.json({ 
        error: "Country code must be in format +XX",
        code: "INVALID_COUNTRY_CODE" 
      }, { status: 400 });
    }

    // Check if profile exists
    const existingProfile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    if (existingProfile.length === 0) {
      return NextResponse.json({ 
        error: 'Profile not found',
        code: 'PROFILE_NOT_FOUND' 
      }, { status: 404 });
    }

    const updated = await db.update(userProfiles)
      .set({
        ...(age !== undefined && { age }),
        ...(dateOfBirth && { dateOfBirth }),
        ...(phone && { phone }),
        ...(countryCode && { countryCode }),
        ...(country && { country }),
        ...(state && { state }),
        ...(city && { city }),
        updatedAt: new Date().toISOString()
      })
      .where(eq(userProfiles.userId, user.id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT profile error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}